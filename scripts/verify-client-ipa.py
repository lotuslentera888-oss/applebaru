"""Verify downloaded IPA artifacts for this client revision; no signing performed."""
import argparse
import hashlib
import io
import json
import plistlib
import struct
from pathlib import Path
from zipfile import ZipFile
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("artifact_dir", type=Path)
parser.add_argument("--output", type=Path)
args = parser.parse_args()
results = []
for mode, title in (("settings", "Settings"), ("phone", "Phone")):
    candidates = list(args.artifact_dir.rglob(f"{title}-unsigned.ipa"))
    assert len(candidates) == 1, candidates
    ipa = candidates[0]
    checksum = Path(str(ipa) + ".sha256").read_text().split()[0]
    assert hashlib.sha256(ipa.read_bytes()).hexdigest() == checksum
    with ZipFile(ipa) as z:
        assert z.testzip() is None
        prefix = "Payload/App.app/"
        info = plistlib.loads(z.read(prefix + "Info.plist"))
        assert info["CFBundleIdentifier"] == f"com.iphonesim.{mode}"
        assert info["CFBundleShortVersionString"] == "1.1.0"
        assert info["CFBundleVersion"] == "3"
        assert info["DTPlatformName"] == "iphoneos"
        binary = z.read(prefix + info["CFBundleExecutable"])
        assert binary[:4] == b"\xcf\xfa\xed\xfe", "Expected thin 64-bit Mach-O"
        assert struct.unpack("<I", binary[4:8])[0] == 0x0100000C, "Expected arm64 CPU type"
        metadata = json.loads(z.read(prefix + "public/revision-bundle.json"))
        assert metadata["app_mode"] == mode
        assert metadata["backend"] == "https://24simulator.vip"
        assert metadata["app_version"] == "1.1.0" and metadata["app_build"] == "3"
        main = [n for n in z.namelist() if n.startswith(prefix + "public/static/js/main.") and n.endswith(".js")]
        assert len(main) == 1 and b"https://24simulator.vip" in z.read(main[0])
        symbol = Image.open(io.BytesIO(z.read(prefix + "public/icons/sf/antenna.png"))).convert("RGBA")
        assert symbol.size == (88, 88)
        alpha = symbol.getchannel("A")
        bbox = alpha.getbbox()
        assert bbox is not None and alpha.getextrema()[0] == 0
        x0, y0, x1, y1 = bbox
        assert max(x1 - x0, y1 - y0) >= 50, "Native glyph too small"
        assert abs((x0 + x1) / 2 - 44) <= 12 and abs((y0 + y1) / 2 - 44) <= 12, "Native glyph not centered"
        assert not any(n.endswith("embedded.mobileprovision") for n in z.namelist())
    item = {"mode": mode, "ipa": str(ipa), "sha256": checksum, "version": "1.1.0", "build": "3", "platform": "iphoneos", "architecture": "arm64", "backend": metadata["backend"], "native_cellular_glyph_bbox": list(bbox), "signing": "unsigned", "physical_iphone_tested": False}
    results.append(item)
    print("VERIFIED:", title, "1.1.0 (3), arm64, backend baru, native SF glyph")
if args.output:
    args.output.write_text(json.dumps(results, indent=2) + "\n")
