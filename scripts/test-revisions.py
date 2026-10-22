"""Functional regression checks against local production build. No real backend calls."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test_reports" / "revisi-ios26"
OUT.mkdir(parents=True, exist_ok=True)
USER = {"id": "revision-test-user", "role": "user", "username": "revision-test"}
DEVICE = {"device_name": "iPhone Simulator", "model_name": "iPhone", "imei": "356789104532198", "imei2": "356789104532206", "serial_number": "SERIAL_HIDDEN_TEST", "capacity": "256 GB", "available": "120 GB", "ios_version": "26.0", "build_version": "simulation", "color": "Silver"}
results = []


def passed(name):
    print("LULUS:", name, flush=True)
    results.append(name)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    context.add_init_script("""if (!localStorage.getItem('auth_token')) { localStorage.setItem('auth_token','mock-local-only'); localStorage.setItem('auth_user',%s); localStorage.setItem('cached_device',%s); }""" % (json.dumps(json.dumps(USER)), json.dumps(json.dumps(DEVICE))))
    errors = []
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))

    def mock(route):
        if route.request.url.endswith("/api/auth/me"):
            route.fulfill(json=USER)
        elif "/api/me/device" in route.request.url:
            route.fulfill(json=DEVICE)
        else:
            route.abort()

    page.route("https://**/*", mock)
    page.goto("http://127.0.0.1:4173/settings")
    page.get_by_test_id("settings-home").wait_for()
    assert "Telkomsel" not in page.get_by_test_id("row-wifi").inner_text()
    assert page.get_by_test_id("row-wifi").inner_text().strip() == "Wi-Fi"
    passed("Wi-Fi awal kosong tanpa nama Telkomsel")
    page.get_by_test_id("row-wifi").click()
    page.get_by_test_id("wifi-page").wait_for()
    assert page.get_by_test_id("wifi-connected").count() == 0
    page.get_by_test_id("wifi-net-IndiHome-2.4G").click()
    assert page.get_by_test_id("wifi-connected").inner_text().startswith("IndiHome-2.4G")
    page.get_by_test_id("ios-back-button").click()
    page.get_by_test_id("settings-home").wait_for()
    page.wait_for_timeout(400)
    assert "IndiHome-2.4G" in page.get_by_test_id("row-wifi").inner_text()
    assert page.locator('[data-navigation-direction="back"]').count() == 1
    passed("Join Wi-Fi simulasi tersimpan dan back memakai arah slide kembali")
    page.reload()
    page.get_by_test_id("settings-home").wait_for()
    assert "IndiHome-2.4G" in page.get_by_test_id("row-wifi").inner_text()
    passed("Pilihan tetap tersimpan setelah relaunch halaman")

    page.get_by_test_id("settings-search").fill("Display")
    assert page.get_by_test_id("row-display").count() == 1
    assert page.get_by_test_id("row-wifi").count() == 0
    page.get_by_test_id("row-display").click()
    page.get_by_test_id("settings-detail-display").wait_for()
    toggle = page.get_by_test_id("pref-settings.display.trueTone")
    before = toggle.get_attribute("aria-checked")
    toggle.click()
    assert toggle.get_attribute("aria-checked") != before
    page.reload()
    page.get_by_test_id("settings-detail-display").wait_for()
    assert page.get_by_test_id("pref-settings.display.trueTone").get_attribute("aria-checked") != before
    passed("Search nyata dan kontrol detail persisten")

    page.goto("http://127.0.0.1:4173/general")
    page.get_by_test_id("general-page").wait_for()
    page.get_by_text("Software Update", exact=True).click()
    page.get_by_test_id("settings-detail-software-update").wait_for()
    page.get_by_test_id("settings-detail-software-update").get_by_test_id("ios-back-button").click()
    page.get_by_test_id("general-page").wait_for()
    page.wait_for_timeout(400)
    passed("Route General detail kembali ke General")
    page.get_by_text("About", exact=True).click()
    page.get_by_test_id("about-page").wait_for()
    assert page.get_by_test_id("about-serial").inner_text().endswith("SERIAL_HIDDEN_TEST")
    passed("Serial Number tetap tersedia pada About")

    page.goto("http://127.0.0.1:4173/bluetooth")
    page.get_by_test_id("bluetooth-page").wait_for()
    page.get_by_test_id("bt-other-JBL Flip 6").click()
    assert page.get_by_test_id("bt-other-JBL Flip 6").locator("svg").count() == 1
    page.get_by_test_id("bluetooth-toggle").click()
    page.reload()
    page.get_by_test_id("bluetooth-page").wait_for()
    assert page.get_by_test_id("bluetooth-toggle").get_attribute("aria-checked") == "false"
    passed("Bluetooth pairing dan toggle simulasi persisten")

    page.goto("http://127.0.0.1:4173/phone")
    page.get_by_test_id("phone-dialer").wait_for()
    for key in ["star", "hash", "0", "6", "hash"]:
        page.get_by_test_id("key-" + key).click()
    page.get_by_test_id("phone-call").click()
    sheet = page.get_by_test_id("imei-info-sheet")
    sheet.wait_for()
    assert "Serial Number" not in sheet.inner_text()
    assert "SERIAL_HIDDEN_TEST" not in sheet.inner_text()
    assert page.get_by_test_id("barcode-serial").count() == 0
    assert page.get_by_test_id("barcode-imei-value").inner_text() == DEVICE["imei"]
    assert page.get_by_test_id("coverage-qr").get_attribute("src").startswith("data:image/png")
    assert "serial_number" not in (ROOT / "frontend/src/pages/Phone.js").read_text()
    passed("*#06# tanpa serial; IMEI/barcode/QR tetap berfungsi")

    page.goto("http://127.0.0.1:4173/settings")
    page.get_by_test_id("settings-home").wait_for()
    icon = page.locator(".ios-icon").first
    assert round(icon.bounding_box()["width"]) == 34
    image = page.locator('img[src="/icons/settings.png"]').first
    assert image.evaluate("node => node.complete && node.naturalWidth > 0")
    page.screenshot(path=str(OUT / "settings.png"), full_page=False)
    passed("Ikon menu 34px dan aset Settings termuat")

    # Every catalogue detail is rendered without touching the real backend.
    routes = json.loads((ROOT / "frontend/public/manus-routes.json").read_text())["routes"]
    details = [route["path"] for route in routes if route["path"].startswith(("/settings/", "/general/"))]
    for route in details:
        page.goto("http://127.0.0.1:4173" + route)
        page.locator('[data-testid^="settings-detail-"]').wait_for()
        assert "Halaman simulasi tidak tersedia" not in page.locator("body").inner_text()
    passed(f"Seluruh {len(details)} route detail katalog dapat dibuka")
    assert not errors, errors
    passed("Tidak ada error JavaScript runtime")
    context.close()
    browser.close()

report = {"passed": results, "total": len(results), "real_backend_accessed": False, "native_iphone_tested": False}
(OUT / "results.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
print(json.dumps(report, ensure_ascii=False, indent=2))
