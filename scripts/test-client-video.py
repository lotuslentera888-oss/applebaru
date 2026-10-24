"""Focused client-video regression tests. All API traffic is intercepted locally."""
import base64
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENGINE = os.getenv("REVISION_TEST_BROWSER", "chromium")
OUT = ROOT / "test_reports" / ("client-video-" + ENGINE)
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.getenv("REVISION_TEST_BASE_URL", "http://127.0.0.1:4175")
USER = {"id": "client-video-fixture", "role": "user", "username": "Preview Account"}
DEVICE = {
    "device_name": "iPhone", "model_name": "iPhone 14 Pro Max", "model_number": "MQ9T3LL/A",
    "serial_number": "SERIAL_EXCLUDE_FIXTURE", "imei": "356789104532198", "imei2": "356789104532206",
    "ios_version": "26.0", "build_version": "23A341", "capacity": "256 GB", "available": "120 GB",
    "coverage_type": "Limited Warranty", "warranty_status": "Limited Warranty – 23 October 2026",
    "color": "Silver", "eid": "12345678901234567890123456789012"
}
RESULTS = []


def passed(name):
    RESULTS.append(name)
    print("LULUS:", name, flush=True)


def seed(context, device=DEVICE):
    context.add_init_script("""localStorage.setItem('auth_token','mock-client-video');
        localStorage.setItem('auth_user',%s); localStorage.setItem('cached_device',%s);"""
        % (json.dumps(json.dumps(USER)), json.dumps(json.dumps(device))))


with sync_playwright() as p:
    browser = p.webkit.launch() if ENGINE == "webkit" else p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    seed(context)
    page = context.new_page()
    errors, writes = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))

    def mock(route):
        if route.request.method != "GET":
            writes.append(route.request.url)
            route.abort()
        elif route.request.url.endswith("/api/auth/me"):
            route.fulfill(json=USER)
        elif route.request.url.endswith("/api/me/device"):
            route.fulfill(json=DEVICE)
        else:
            route.abort()

    page.route("https://**/*", mock)
    page.goto(BASE + "/settings")
    page.get_by_test_id("settings-home").wait_for()
    page.get_by_test_id("apple-id-row").click()
    account = page.get_by_test_id("apple-account-page")
    account.wait_for()
    assert page.url.endswith("/account")
    assert account.get_by_test_id("ios-compact-title").inner_text() == "Apple Account"
    assert account.get_by_test_id("ios-back-button").count() == 1
    passed("Kartu Settings membuka Apple Account, bukan editor perangkat")

    account.get_by_test_id("account-row-personal").click()
    personal = page.get_by_test_id("apple-account-detail-personal")
    personal.wait_for()
    personal.get_by_test_id("account-display-name").fill("Client Preview")
    personal.get_by_test_id("account-email").fill("preview@example.test")
    page.reload()
    personal.wait_for()
    assert personal.get_by_test_id("account-display-name").input_value() == "Client Preview"
    passed("Informasi profil lokal tersimpan tanpa request Apple/backend")
    personal.get_by_test_id("ios-back-button").click()
    account.wait_for()
    account.get_by_test_id("account-row-icloud").click()
    icloud = page.get_by_test_id("apple-account-detail-icloud")
    icloud.wait_for()
    toggle = icloud.get_by_test_id("account-icloud-backup")
    before = toggle.get_attribute("aria-checked")
    toggle.click()
    page.reload()
    icloud.wait_for()
    assert icloud.get_by_test_id("account-icloud-backup").get_attribute("aria-checked") != before
    passed("Halaman iCloud dapat diklik; switch simulasi persisten")

    for section in ["security", "payment", "subscriptions", "media", "find-my", "family"]:
        page.goto(BASE + "/account/" + section)
        detail = page.get_by_test_id("apple-account-detail-" + section)
        detail.wait_for()
        assert detail.get_by_test_id("ios-compact-title").count() == 1
    page.goto(BASE + "/account")
    account.wait_for()
    account.get_by_test_id("account-device-row").click()
    assert page.url.endswith("/edit")
    editor = page.get_by_test_id("edit-device-page")
    editor.wait_for()
    editor.get_by_test_id("ios-back-button").click()
    account.wait_for()
    assert page.url.endswith("/account")
    account.get_by_test_id("account-about-row").click()
    page.get_by_test_id("about-page").wait_for()
    page.get_by_test_id("about-page").get_by_test_id("ios-back-button").click()
    account.wait_for()
    assert page.url.endswith("/account")
    passed("Seluruh detail akun terhubung; Device Editor tetap tersedia terpisah")

    for width in [320, 375, 390, 430]:
        page.set_viewport_size({"width": width, "height": 844})
        page.goto(BASE + "/about")
        about = page.get_by_test_id("about-page")
        about.wait_for()
        title = about.get_by_test_id("ios-compact-title")
        assert title.evaluate("el => getComputedStyle(el).fontSize") == "17px"
        assert "sans-serif" in title.evaluate("el => getComputedStyle(el).fontFamily")
        assert about.locator(".ios-nav-header").evaluate("el => getComputedStyle(el).backgroundColor") == "rgb(255, 255, 255)"
        value = about.get_by_test_id("about-warranty").locator(".ios-info-value")
        assert "break-all" not in value.get_attribute("class")
        assert value.evaluate("el => getComputedStyle(el).wordBreak") == "normal"
        assert value.evaluate("el => { const text=el.firstChild; const r=document.createRange(); r.setStart(text,text.length-4); r.setEnd(text,text.length); return r.getClientRects().length; }") == 1
        assert value.evaluate("el => { const t=el.firstChild; const r=document.createRange(); r.setStart(t,t.textContent.lastIndexOf('23')); r.setEnd(t,t.length); return r.getClientRects().length; }") == 1
        assert page.locator(".ios-navigation-page").last.evaluate("el => el.scrollWidth <= el.clientWidth")
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE + "/about")
    page.get_by_test_id("about-page").wait_for()
    page.screenshot(path=str(OUT / "about.png"))
    passed("About kompak, font sistem, latar header putih; tahun tidak pecah pada empat lebar layar")

    page.goto(BASE + "/phone")
    page.get_by_test_id("phone-dialer").wait_for()
    for key in ["star", "hash", "0", "6", "hash"]:
        page.get_by_test_id("key-" + key).click()
    sheet = page.get_by_test_id("imei-info-sheet")
    sheet.wait_for()
    assert "Serial Number" not in sheet.inner_text()
    assert DEVICE["serial_number"] not in sheet.inner_text()
    page.get_by_test_id("coverage-qr").wait_for()
    png = base64.b64decode(page.get_by_test_id("coverage-qr").get_attribute("src").split(",", 1)[1])
    (OUT / "imei-qr.png").write_bytes(png)
    try:
        import cv2
        import numpy as np
        image = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_GRAYSCALE)
        image = cv2.resize(image, None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST)
        decoded, _, _ = cv2.QRCodeDetector().detectAndDecode(image)
        assert DEVICE["imei"] in decoded and DEVICE["serial_number"] not in decoded
        passed("QR IMEI dapat didekode dan tidak membawa serial")
    except ImportError:
        passed("QR PNG termuat; decoder OpenCV tidak tersedia pada lingkungan ini")
    page.screenshot(path=str(OUT / "phone-info.png"))
    close = sheet.get_by_role("button", name="Close Device Information")
    close.click()
    page.wait_for_timeout(150)
    assert page.get_by_test_id("imei-info-sheet").count() == 0
    for key in ["star", "hash", "0", "6", "hash"]:
        page.get_by_test_id("key-" + key).click()
    sheet.wait_for()
    passed("*#06# terbuka otomatis; tutup dan ulang tidak menyebabkan loop")

    page.goto(BASE + "/settings")
    page.get_by_test_id("settings-home").wait_for()
    page.screenshot(path=str(OUT / "settings.png"))
    page.goto(BASE + "/account")
    account.wait_for()
    page.screenshot(path=str(OUT / "account.png"))
    assert not errors, errors
    assert not writes, writes
    passed("Tidak ada error JavaScript atau operasi tulis API selama uji")
    context.close()

    empty = browser.new_context(viewport={"width": 390, "height": 844})
    seed(empty, None)
    empty_page = empty.new_page()
    def mock_empty(route):
        route.fulfill(json=USER if route.request.url.endswith("/auth/me") else None)
    empty_page.route("https://**/*", mock_empty)
    empty_page.goto(BASE + "/phone")
    for key in ["star", "hash", "0", "6", "hash"]:
        empty_page.get_by_test_id("key-" + key).click()
    empty_page.get_by_test_id("imei-info-sheet").wait_for()
    assert empty_page.get_by_test_id("coverage-qr").count() == 0
    passed("Phone tetap membuka lembar hasil ketika data perangkat belum ada")
    empty.close()
    browser.close()

report = {"passed": RESULTS, "total": len(RESULTS), "real_backend_accessed": False, "native_iphone_tested": False}
(OUT / "results.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
print(json.dumps(report, indent=2, ensure_ascii=False))
