"""Capture unchanged IPA web UI with WebKit and mock data, not a physical-iPhone photo."""
import argparse
import ast
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zipfile import ZipFile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("artifact_dir", type=Path)
parser.add_argument("output_dir", type=Path)
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
WORK = args.output_dir / ".bundles"
VALUES = {}
for node in ast.parse((ROOT / "scripts/test-client-video.py").read_text()).body:
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in ["USER", "DEVICE"]:
                VALUES[target.id] = ast.literal_eval(node.value)
USER = dict(VALUES["USER"], username="Preview Account", email="preview@example.test")
DEVICE = dict(VALUES["DEVICE"], serial_number="DEMO12345678", part_number="MQ9T3LL/A", songs=0, videos=0, photos=0, applications=12)

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def do_GET(self):
        path = Path(self.directory) / self.path.split("?", 1)[0].lstrip("/")
        if not path.exists() and "." not in path.name:
            self.path = "/index.html"
        super().do_GET()

servers = []
metadata = {}
try:
    for mode, title, port in [("settings", "Settings", 4197), ("phone", "Phone", 4198)]:
        candidates = list(args.artifact_dir.rglob(title + "-unsigned.ipa"))
        assert len(candidates) == 1
        destination = WORK / mode
        destination.mkdir(parents=True, exist_ok=True)
        with ZipFile(candidates[0]) as z:
            prefix = "Payload/App.app/public/"
            metadata[mode] = json.loads(z.read(prefix + "revision-bundle.json"))
            assert metadata[mode]["app_version"] == "1.2.0" and metadata[mode]["app_build"] == "4"
            for name in z.namelist():
                if name.startswith(prefix) and not name.endswith("/"):
                    relative = Path(name[len(prefix):])
                    assert ".." not in relative.parts
                    target = destination / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(z.read(name))
        server = ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=str(destination)))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        servers.append(server)

    with sync_playwright() as p:
        browser = p.webkit.launch()
        for mode, port in [("settings", 4197), ("phone", 4198)]:
            context = browser.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
            context.add_init_script("localStorage.setItem('auth_token','mock-preview');localStorage.setItem('auth_user',%s);localStorage.setItem('cached_device',%s);" % (json.dumps(json.dumps(USER)), json.dumps(json.dumps(DEVICE))))
            def mock(route):
                if route.request.method != "GET": route.abort()
                elif route.request.url.endswith("/auth/me"): route.fulfill(json=USER)
                elif route.request.url.endswith("/me/device"): route.fulfill(json=DEVICE)
                else: route.abort()
            context.route("**/api/**", mock)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            def screenshot(route, name, scroll=False, code=False):
                page.goto(f"http://127.0.0.1:{port}/" + route)
                page.get_by_test_id("ios-navigation").wait_for()
                page.wait_for_timeout(500)
                if scroll:
                    page.evaluate("""()=>{const p=document.querySelector('.ios-navigation-page'),r=document.querySelector('[data-testid=row-general]');p.scrollTop+=r.getBoundingClientRect().top-p.getBoundingClientRect().top-56;}""")
                if code:
                    for key in ["star","hash","0","6","hash"]: page.get_by_test_id("key-"+key).click()
                    page.get_by_test_id("imei-info-sheet").wait_for()
                    page.get_by_test_id("coverage-qr").wait_for()
                    assert DEVICE["serial_number"] not in page.get_by_test_id("imei-info-sheet").inner_text()
                page.wait_for_function("Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)")
                page.wait_for_timeout(500)
                page.screenshot(path=str(args.output_dir/(name+".png")), animations="disabled")
                print("CAPTURED:",name,flush=True)
            if mode == "settings":
                screenshot("settings","01-Settings-Light")
                screenshot("settings","02-Settings-Light-General",scroll=True)
                page.goto(f"http://127.0.0.1:{port}/settings/display")
                page.get_by_test_id("appearance-dark").click()
                screenshot("settings","03-Settings-Dark")
                screenshot("settings","04-Settings-Dark-General",scroll=True)
                screenshot("about","05-About-Dark")
                screenshot("settings/display","06-Display-Dark")
                screenshot("account","07-Apple-Account-Dark")
            else:
                screenshot("phone","08-Phone-hasil-kode",code=True)
            assert not errors, errors
            context.close()
        browser.close()
finally:
    for server in servers:
        server.shutdown()
        server.server_close()
(args.output_dir/"ASAL_SCREENSHOT.txt").write_text("UI tidak diedit. Sumber: isi dua IPA 1.2.0 build 4; rendering WebKit, bukan screenshot iPhone fisik. Akun/data perangkat contoh lokal. Semua API dimock tanpa login atau tulis ke produksi.\n"+json.dumps(metadata,indent=2)+"\n")
print("DONE:",args.output_dir,flush=True)
