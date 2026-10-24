"""Generate/validate source and bundle fingerprints; excludes native-exported SF PNGs."""
import argparse
import hashlib
import json
import plistlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def digest(paths, base):
    h = hashlib.sha256()
    for p in sorted(paths, key=lambda item: str(item.relative_to(base))):
        h.update(str(p.relative_to(base)).encode())
        h.update(b"\0")
        h.update(p.read_bytes())
        h.update(b"\0")
    return h.hexdigest()


def source_hash():
    front = ROOT / "frontend"
    files = [p for folder in (front / "src", front / "public") for p in folder.rglob("*")
             if p.is_file() and "icons/sf/" not in p.as_posix()]
    files += [front / name for name in ("package.json", "yarn.lock", "craco.config.js", "tailwind.config.js", "postcss.config.js") if (front / name).is_file()]
    return digest(files, front)


parser = argparse.ArgumentParser()
parser.add_argument("mode", nargs="?", choices=["settings", "phone"])
parser.add_argument("--source-hash", action="store_true")
parser.add_argument("--write", action="store_true")
parser.add_argument("--check", action="store_true")
parser.add_argument("--expected-source-hash")
parser.add_argument("--backend")
args = parser.parse_args()
current_source = source_hash()
if args.source_hash:
    print(current_source)
    raise SystemExit(0)
if not args.mode or args.write == args.check:
    parser.error("provide mode plus exactly one of --write or --check")
if args.expected_source_hash and current_source != args.expected_source_hash:
    raise SystemExit("Frontend changed while compiling; rebuild instead of packaging a mixed revision.")

bundle = ROOT / "mobile" / args.mode / "www"
manifest = bundle / "revision-bundle.json"
files = [p for p in bundle.rglob("*") if p.is_file() and p != manifest and "icons/sf/" not in p.as_posix()]
backend = (args.backend or (ROOT / "mobile/backend-url.txt").read_text()).strip().rstrip("/")
with (ROOT / "mobile" / args.mode / "ios/App/App/Info.plist").open("rb") as f:
    plist = plistlib.load(f)
expected = {
    "app_mode": args.mode,
    "backend": backend,
    "app_version": plist["CFBundleShortVersionString"],
    "app_build": plist["CFBundleVersion"],
    "frontend_source_sha256": current_source,
    "web_bundle_sha256": digest(files, bundle),
}
if not (bundle / "index.html").is_file():
    raise SystemExit("Missing compiled index.html; run mobile/build-web.sh first.")
main_files = list((bundle / "static/js").glob("main.*.js"))
if len(main_files) != 1 or backend.encode() not in main_files[0].read_bytes():
    raise SystemExit("Compiled bundle does not contain the configured backend.")
if args.write:
    manifest.write_text(json.dumps(expected, indent=2) + "\n")
    print("Bundle fingerprint written:", args.mode)
else:
    if not manifest.is_file():
        raise SystemExit("Missing bundle fingerprint; rebuild web before packaging IPA.")
    saved = json.loads(manifest.read_text())
    if saved != expected:
        changed = [key for key in expected if saved.get(key) != expected[key]]
        raise SystemExit("Stale or mismatched web bundle: " + ", ".join(changed))
    print("Source/backend/version/bundle verified:", args.mode)
