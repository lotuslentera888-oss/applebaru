"""Dark-mode, contrast, persistence, and responsive regression coverage.

This script intentionally owns only this test file.  It uses the same local
fixtures as test-client-video.py and intercepts API traffic; it never reaches
a production API.  Run after the UI server is ready on port 4177 (or set
REVISION_TEST_BASE_URL).
"""
import base64
import json
import os
import re
import sys
import traceback
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENGINE = os.getenv("REVISION_TEST_BROWSER", "chromium")
BASE = os.getenv("REVISION_TEST_BASE_URL", "http://127.0.0.1:4177")
OUT = ROOT / "test_reports" / os.getenv("REVISION_TEST_REPORT_TAG", f"dark-mode-{ENGINE}")
OUT.mkdir(parents=True, exist_ok=True)

# Keep these fixtures byte-for-byte compatible with scripts/test-client-video.py.
USER = {"id": "client-video-fixture", "role": "user", "username": "Preview Account"}
DEVICE = {
    "device_name": "iPhone", "model_name": "iPhone 14 Pro Max", "model_number": "MQ9T3LL/A",
    "serial_number": "SERIAL_EXCLUDE_FIXTURE", "imei": "356789104532198", "imei2": "356789104532206",
    "ios_version": "26.0", "build_version": "23A341", "capacity": "256 GB", "available": "120 GB",
    "coverage_type": "Limited Warranty", "warranty_status": "Limited Warranty – 23 October 2026",
    "color": "Silver", "eid": "12345678901234567890123456789012",
}

ROOT_GROUPS = {
    "connectivity": ["airplane", "wifi", "bluetooth", "cellular", "hotspot", "battery"],
    "appearance": ["general", "accessibility", "action-button", "apple-intelligence", "camera", "control-center", "display", "home-screen", "search", "standby", "wallpaper"],
    "alerts": ["notifications", "sounds", "focus", "screen-time"],
    "privacy": ["face-id", "emergency-sos", "privacy"],
    "account": ["game-center", "icloud", "wallet"],
    "apps": ["apps"],
}
ACCOUNT_SECTIONS = ["personal", "security", "payment", "subscriptions", "icloud", "media", "find-my", "family"]
SPECIAL_ROUTES = {"wifi", "bluetooth", "general", "icloud"}
RESULTS = {"passed": [], "failed": [], "screenshots": [], "route_inventory": {}, "unexpected_gets": [], "writes": [], "page_errors": []}


def progress(message):
    print(f"PROGRESS: {message}", flush=True)


def passed(name):
    RESULTS["passed"].append(name)
    print(f"PASS: {name}", flush=True)


def seed(context, device=DEVICE):
    context.add_init_script(
        """localStorage.setItem('auth_token','mock-client-video');
        localStorage.setItem('auth_user',%s); localStorage.setItem('cached_device',%s);"""
        % (json.dumps(json.dumps(USER)), json.dumps(json.dumps(device)))
    )


def catalog_inventory():
    """Derive only top-level item keys; inline control objects cannot match this regex."""
    source = (ROOT / "frontend" / "src" / "lib" / "settingsCatalog.js").read_text(encoding="utf-8")
    before_general = source.split("export const generalGroups", 1)[0]
    item_re = re.compile(r'^\s{6}\{\s*key:\s*"([^"]+)"(?:,\s*label:\s*"([^"]+)")?', re.MULTILINE)
    pairs = item_re.findall(before_general)
    keys = [key for key, _ in pairs]
    labels = {key: label for key, label in pairs if label}
    legacy_segment = before_general.split("export const legacySettingsGroups", 1)[1]
    legacy_segment = legacy_segment.split("export const generalGroups", 1)[0]
    legacy_pairs = item_re.findall(legacy_segment)
    legacy_keys = [key for key, _ in legacy_pairs]
    generic = [key for key in keys if key not in SPECIAL_ROUTES]
    return {"keys": keys, "labels": labels, "legacy_keys": legacy_keys, "generic_keys": generic}


# Browser-side contrast audit. It deliberately checks primary labels/info labels,
# values, headers, body, and secondary section text—not every control/icon color.
DARK_AUDIT_JS = r"""
() => {
  const failures = [];
  const metrics = [];
  const visible = (el) => {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0;
  };
  const color = (value) => {
    if (!value || value === 'transparent') return null;
    const m = value.match(/rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)(?:[, /]+\s*([\d.]+))?\s*\)/i);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
    const h = value.match(/^#([0-9a-f]{3,8})$/i);
    if (h) {
      let x = h[1];
      if (x.length === 3 || x.length === 4) x = x.split('').map((c) => c + c).join('');
      return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), x.length >= 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1];
    }
    return null;
  };
  const opaqueBackground = (el, preferredSelector) => {
    if (preferredSelector) {
      const preferred = el.closest(preferredSelector);
      if (preferred) {
        const c = color(getComputedStyle(preferred).backgroundColor);
        if (c && c[3] > 0.01) return c;
      }
    }
    for (let n = el; n; n = n.parentElement) {
      const c = color(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0.01) return c;
    }
    return color(getComputedStyle(document.body).backgroundColor) || color(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255, 1];
  };
  const luminance = (c) => {
    const rgb = c.slice(0, 3).map((v) => v / 255).map((v) => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  const ratio = (fg, bg) => {
    if (!fg || !bg || fg[3] < .99 || bg[3] < .99) return null;
    const a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  };
  const check = (el, kind, preferred, minimum, againstPage) => {
    if (!visible(el)) return;
    const s = getComputedStyle(el);
    const fg = color(s.color);
    const bg = againstPage ? opaqueBackground(el) : opaqueBackground(el, preferred);
    const value = ratio(fg, bg);
    const item = {kind, text: (el.innerText || '').trim().slice(0, 90), color: s.color, background: `rgb(${bg.slice(0, 3).join(',')})`, ratio: value};
    metrics.push(item);
    if (value === null || value < minimum) failures.push(item);
  };
  document.querySelectorAll('.ios-row-label, .ios-info-label').forEach((el) => check(el, 'primary-label', '.ios-group', 4.5, false));
  document.querySelectorAll('.ios-info-value').forEach((el) => check(el, 'info-value', '.ios-group', 4.5, false));
  document.querySelectorAll('.ios-nav-header h1, .ios-large-title h1').forEach((el) => check(el, 'header-title', el.closest('.ios-nav-header') ? '.ios-nav-header' : '.ios-navigation-page', 4.5, false));
  const footerColor = color(getComputedStyle(document.documentElement).getPropertyValue('--ios-footer').trim());
  document.querySelectorAll('.ios-navigation-page *').forEach((el) => {
    if (!visible(el) || !(el.innerText || '').trim()) return;
    const c = color(getComputedStyle(el).color);
    if (footerColor && c && c.slice(0, 3).every((v, i) => Math.abs(v - footerColor[i]) <= 2)) check(el, 'secondary-footer-or-section', null, 4.5, true);
  });
  const bodyStyle = getComputedStyle(document.body);
  const bodyBg = opaqueBackground(document.body);
  const bodyRatio = ratio(color(bodyStyle.color), bodyBg);
  metrics.push({kind: 'body', text: '', color: bodyStyle.color, background: `rgb(${bodyBg.slice(0, 3).join(',')})`, ratio: bodyRatio});
  if (bodyRatio === null || bodyRatio < 4.5) failures.push(metrics[metrics.length - 1]);
  const page = document.querySelector('.ios-navigation-page');
  const overflow = page ? {pageScrollWidth: page.scrollWidth, pageClientWidth: page.clientWidth, documentScrollWidth: document.documentElement.scrollWidth, documentClientWidth: document.documentElement.clientWidth} : {};
  if (page && page.scrollWidth > page.clientWidth + 1) failures.push({kind: 'horizontal-overflow', ...overflow});
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) failures.push({kind: 'document-horizontal-overflow', ...overflow});
  return {theme: document.documentElement.dataset.theme, failures, metrics, overflow};
}
"""


def goto(page, path, wait_selector=None):
    page.goto(BASE + path, wait_until="domcontentloaded")
    page.get_by_test_id("ios-navigation").wait_for(state="attached")
    page.wait_for_timeout(120)
    if wait_selector:
        page.locator(wait_selector).wait_for(state="visible")


def audit_dark(page, label):
    result = page.evaluate(DARK_AUDIT_JS)
    assert result["theme"] == "dark", f"{label}: html theme is {result['theme']!r}"
    assert not result["failures"], f"{label}: contrast/overflow failures: {json.dumps(result['failures'], ensure_ascii=False)}"
    return result


def set_appearance(page, choice):
    goto(page, "/settings/display", "[data-testid='settings-detail-display']")
    page.get_by_test_id(f"appearance-{choice.lower()}").click()
    page.wait_for_timeout(180)
    assert page.evaluate("document.documentElement.dataset.theme") == choice.lower(), f"appearance {choice} did not apply"


def compact_title_assertions(page):
    title = page.get_by_test_id("ios-compact-title")
    assert title.is_visible(), "compact title is not visible after root scroll"
    assert title.evaluate("el => getComputedStyle(el).fontSize") == "17px"
    large = page.locator(".ios-large-title h1").first
    assert large.get_attribute("aria-hidden") == "true"
    overlap = page.evaluate(
        """() => { const a=document.querySelector('[data-testid="ios-compact-title"]')?.getBoundingClientRect();
        const b=document.querySelector('.ios-large-title h1')?.getBoundingClientRect();
        return !!(a && b && a.bottom > b.top && b.bottom > a.top); }"""
    )
    assert not overlap, "compact title overlaps the large title"


def synthetic_swipe_back(page):
    # Navigation only reads touches/clientX/clientY, so this avoids raw-image or native dependencies.
    page.evaluate(
        """() => {
          const node = document.querySelector('[data-testid="ios-navigation"]');
          const emit = (type, touches) => { const e = new Event(type, {bubbles:true});
            Object.defineProperty(e, 'touches', {value: touches}); node.dispatchEvent(e); };
          emit('touchstart', [{clientX: 2, clientY: 250}]);
          emit('touchmove', [{clientX: 112, clientY: 252}]);
          emit('touchend', []);
        }"""
    )
    page.wait_for_timeout(500)


def run_case(name, fn):
    case_filter = os.getenv("REVISION_TEST_CASE_FILTER", "")
    if case_filter and not re.search(case_filter, name):
        return
    progress(name)
    try:
        fn()
        passed(name)
    except Exception as exc:  # Keep running to collect an actionable route/viewport report.
        detail = {"name": name, "error": str(exc), "traceback": traceback.format_exc(limit=4)}
        RESULTS["failed"].append(detail)
        print(f"FAIL: {name}: {exc}", flush=True)


def main():
    inventory = catalog_inventory()
    RESULTS["route_inventory"] = inventory
    assert list(ROOT_GROUPS) == ["connectivity", "appearance", "alerts", "privacy", "account", "apps"]
    assert all(key in inventory["keys"] for keys in ROOT_GROUPS.values() for key in keys)
    progress(f"Derived generic top-level routes: {', '.join(inventory['generic_keys'])}")

    writes = RESULTS["writes"]
    unexpected_gets = RESULTS["unexpected_gets"]
    page_errors = RESULTS["page_errors"]

    with sync_playwright() as p:
        if ENGINE not in {"chromium", "webkit"}:
            raise ValueError("REVISION_TEST_BROWSER must be chromium or webkit")
        browser = p.webkit.launch() if ENGINE == "webkit" else p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, color_scheme="light")
        seed(context)
        page = context.new_page()
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        def mock(route):
            request = route.request
            if request.method != "GET":
                writes.append({"method": request.method, "url": request.url})
                route.abort()
            elif request.url.endswith("/api/auth/me"):
                route.fulfill(status=200, json=USER)
            elif request.url.endswith("/api/me/device"):
                route.fulfill(status=200, json=DEVICE)
            else:
                unexpected_gets.append(request.url)
                route.abort()

        # Match only API URLs so the UI document/static assets still load normally.
        context.route("**/api/**", mock)

        def root_order_and_light_screenshot():
            goto(page, "/settings", "[data-testid='settings-home']")
            assert page.evaluate("document.documentElement.dataset.theme") == "light"
            groups = page.locator("[data-testid^='group-']")
            assert groups.count() == len(ROOT_GROUPS)
            ids = groups.evaluate_all("els => els.map(el => el.dataset.testid.replace('group-', ''))")
            assert ids == list(ROOT_GROUPS), f"root group order {ids!r}"
            for group_id, expected in ROOT_GROUPS.items():
                group = page.get_by_test_id(f"group-{group_id}")
                actual = group.locator(".ios-row").evaluate_all("els => els.map(el => (el.dataset.testid || '').replace('row-', ''))")
                assert actual == expected, f"{group_id} row order {actual!r}"
            screenshot = OUT / "Settings-Light-390w844.png"
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))

        run_case("Settings root group and row order is exact; light screenshot captured", root_order_and_light_screenshot)

        def appearance_persistence_and_media():
            set_appearance(page, "Dark")
            screenshot = OUT / "Appearance-Dark-390w844.png"
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))
            goto(page, "/settings/display", "[data-testid='settings-detail-display']")
            assert page.evaluate("document.documentElement.dataset.theme") == "dark"
            page.reload(wait_until="domcontentloaded")
            page.get_by_test_id("settings-detail-display").wait_for()
            page.wait_for_timeout(180)
            assert page.evaluate("document.documentElement.dataset.theme") == "dark", "dark mode did not persist through reload"
            for choice in ["Light", "Dark", "Light", "Dark", "Light"]:
                page.get_by_test_id(f"appearance-{choice.lower()}").click()
                page.wait_for_timeout(100)
                assert page.evaluate("document.documentElement.dataset.theme") == choice.lower()
            assert page.evaluate("localStorage.getItem('ios26-simulator/preferences/client-video-fixture/settings.display.appearance')") == '"Light"'
            page.get_by_test_id("appearance-automatic").click()
            page.emulate_media(color_scheme="dark")
            page.wait_for_timeout(180)
            assert page.evaluate("document.documentElement.dataset.theme") == "dark", "Automatic did not follow dark media"
            page.emulate_media(color_scheme="light")
            page.wait_for_timeout(180)
            assert page.evaluate("document.documentElement.dataset.theme") == "light", "Automatic did not follow light media"
            page.get_by_test_id("appearance-light").click()
            page.emulate_media(color_scheme="light")
            page.wait_for_timeout(120)

        run_case("Appearance persists, repeated Light/Dark ends Light, and Automatic follows media", appearance_persistence_and_media)

        def responsive_focus_checks():
            # Ensure this bounded grid starts in Light and covers all requested widths.
            set_appearance(page, "Light")
            for width in [320, 375, 390, 430]:
                page.set_viewport_size({"width": width, "height": 844})
                goto(page, "/settings", "[data-testid='settings-home']")
                nav_box = page.get_by_test_id("ios-navigation").bounding_box()
                search_box = page.locator(".ios-settings-search").bounding_box()
                assert nav_box and search_box and (search_box["y"] + search_box["height"]) <= nav_box["y"] + nav_box["height"] + 1, f"search pill escapes viewport at {width}px"
                owners = page.evaluate(
                    """() => Array.from(document.querySelectorAll('*')).filter(el => {
                      const s=getComputedStyle(el), r=el.getBoundingClientRect();
                      return r.width > 0 && r.height > 0 && ['auto','scroll'].includes(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
                    }).map(el => el.className || el.tagName)"""
                )
                assert len(owners) == 1, f"expected one real scroll owner at {width}px, got {owners!r}"
                page.locator(".ios-navigation-page").evaluate("el => { el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event('scroll', {bubbles:true})); }")
                page.wait_for_timeout(160)
                app_box = page.get_by_test_id("row-apps").bounding_box()
                search_box = page.locator(".ios-settings-search").bounding_box()
                assert app_box and search_box and (app_box["y"] + app_box["height"]) <= search_box["y"] + 1, f"Apps row is hidden behind search at {width}px"
                compact_title_assertions(page)
                assert page.locator(".ios-navigation-page").evaluate("el => el.scrollWidth <= el.clientWidth")

            page.goto(BASE + "/settings", wait_until="domcontentloaded")
            page.get_by_test_id("settings-home").wait_for()
            page.get_by_test_id("settings-search").fill("Notifications")
            assert page.get_by_test_id("group-alerts").count() == 1
            assert page.get_by_test_id("row-notifications").is_visible()
            assert page.get_by_test_id("row-wifi").count() == 0
            page.get_by_test_id("row-notifications").click()
            page.get_by_test_id("settings-detail-notifications").wait_for()
            page.wait_for_timeout(650)
            assert page.locator(".ios-settings-search").count() == 0, "search pill remained after route switch"

        run_case("Responsive focus grid keeps search, scroll ownership, title, filtering, and route transition safe", responsive_focus_checks)

        def capture_dark_settings_screenshot():
            page.set_viewport_size({"width": 390, "height": 844})
            set_appearance(page, "Dark")
            goto(page, "/settings", "[data-testid='settings-home']")
            audit_dark(page, "Settings root")
            screenshot = OUT / "Settings-Dark-390w844.png"
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))

        run_case("Dark Settings root has audited contrast and screenshot", capture_dark_settings_screenshot)

        def dark_route_coverage():
            page.set_viewport_size({"width": 390, "height": 844})
            set_appearance(page, "Dark")
            # Settings root, General, and About.
            goto(page, "/settings", "[data-testid='settings-home']")
            audit_dark(page, "Settings root coverage")
            goto(page, "/general", "[data-testid='general-page']")
            audit_dark(page, "General coverage")
            screenshot = OUT / "About-Dark-390w844.png"
            goto(page, "/about", "[data-testid='about-page']")
            audit_dark(page, "About coverage")
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))

            # Every current generic SettingsDetail route is derived from catalog source.
            for key in inventory["generic_keys"]:
                goto(page, f"/settings/{key}", f"[data-testid='settings-detail-{key}']")
                audit_dark(page, f"generic settings route {key}")

            # Appearance detail screenshot is separate from the settings-root screenshot.
            goto(page, "/settings/display", "[data-testid='settings-detail-display']")
            audit_dark(page, "Appearance detail")
            screenshot = OUT / "Appearance-Dark-390w844.png"
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))

            for path, selector, label in [
                ("/wifi", "[data-testid='wifi-page']", "Wi-Fi"),
                ("/bluetooth", "[data-testid='bluetooth-page']", "Bluetooth"),
            ]:
                goto(page, path, selector)
                audit_dark(page, f"{label} coverage")

            # Account main, every account section, local personal fields, and iCloud.
            goto(page, "/account", "[data-testid='apple-account-page']")
            audit_dark(page, "Apple Account root")
            screenshot = OUT / "Account-Dark-390w844.png"
            page.screenshot(path=str(screenshot))
            RESULTS["screenshots"].append(str(screenshot))
            for section in ACCOUNT_SECTIONS:
                goto(page, f"/account/{section}", f"[data-testid='apple-account-detail-{section}']")
                audit_dark(page, f"Apple Account {section}")
                if section == "personal":
                    page.get_by_test_id("account-display-name").fill("Dark Mode Preview")
                    page.get_by_test_id("account-email").fill("dark@example.test")
                    page.reload(wait_until="domcontentloaded")
                    page.get_by_test_id("apple-account-detail-personal").wait_for()
                    assert page.get_by_test_id("account-display-name").input_value() == "Dark Mode Preview"
                    assert page.get_by_test_id("account-email").input_value() == "dark@example.test"
                    audit_dark(page, "Apple Account personal after reload")
                if section == "icloud":
                    toggle = page.get_by_test_id("account-icloud-backup")
                    before = toggle.get_attribute("aria-checked")
                    toggle.click()
                    page.reload(wait_until="domcontentloaded")
                    page.get_by_test_id("apple-account-detail-icloud").wait_for()
                    assert toggle.get_attribute("aria-checked") != before
                    audit_dark(page, "Apple Account iCloud after persistence")

            # Apps and each legacy row actually linked by the Apps detail page.
            goto(page, "/settings/apps", "[data-testid='settings-detail-apps']")
            audit_dark(page, "Apps detail")
            for key in inventory["legacy_keys"]:
                if key == "vpn":  # The app page intentionally excludes VPN from its linked list.
                    continue
                label = inventory["labels"].get(key)
                assert label, f"missing source-derived label for legacy route {key}"
                goto(page, "/settings/apps", "[data-testid='settings-detail-apps']")
                row = page.locator("[data-testid='settings-detail-apps'] .ios-row").filter(has_text=label).first
                row.click()
                page.get_by_test_id(f"settings-detail-{key}").wait_for()
                audit_dark(page, f"Apps linked legacy route {key}")

            # iCloud entered from Settings carries the explicit Settings back target.
            goto(page, "/settings", "[data-testid='settings-home']")
            page.get_by_test_id("row-icloud").click()
            page.get_by_test_id("apple-account-detail-icloud").wait_for()
            audit_dark(page, "iCloud entered from Settings")
            synthetic_swipe_back(page)
            assert page.url.endswith("/settings"), f"iCloud swipe-back returned to {page.url}"
            assert page.get_by_test_id("settings-home").count() == 1

        run_case("Darkness covers Settings, General/About, generic routes, connectivity, account, iCloud, and Apps legacy links", dark_route_coverage)

        def phone_dark_qr():
            set_appearance(page, "Dark")
            goto(page, "/phone", "[data-testid='phone-dialer']")
            audit_dark(page, "Phone dialer")
            for key in ["star", "hash", "0", "6", "hash"]:
                page.get_by_test_id(f"key-{key}").click()
            sheet = page.get_by_test_id("imei-info-sheet")
            sheet.wait_for()
            audit_dark(page, "Phone device information sheet")
            for barcode in sheet.locator(".ios-code-scan").all():
                assert barcode.evaluate("el => getComputedStyle(el).backgroundColor") == "rgb(255, 255, 255)", "Barcode lost its light scan background"
                assert barcode.locator('rect[fill="#ffffff"]').count() > 0, "Barcode SVG has no white background"
            text = sheet.inner_text()
            assert "Serial Number" not in text
            assert DEVICE["serial_number"] not in text
            qr = page.get_by_test_id("coverage-qr")
            qr.wait_for()
            src = qr.get_attribute("src")
            assert src and src.startswith("data:image")
            png = base64.b64decode(src.split(",", 1)[1])
            qr_parent_bg = qr.locator("..")
            background = qr_parent_bg.evaluate("el => getComputedStyle(el).backgroundColor")
            assert background not in {"transparent", "rgba(0, 0, 0, 0)"}, f"QR background is not opaque: {background}"
            try:
                import cv2
                import numpy as np
                image = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_GRAYSCALE)
                image = cv2.resize(image, None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST)
                decoded, _, _ = cv2.QRCodeDetector().detectAndDecode(image)
                expected = f"IMEI:{DEVICE['imei']};IMEI2:{DEVICE['imei2']}"
                assert decoded == expected, f"QR decoded content changed: {decoded!r} != {expected!r}"
                assert DEVICE["serial_number"] not in decoded
            except ImportError:
                raise AssertionError("OpenCV decoder is required for this regression environment")

        run_case("Dark Phone QR keeps an opaque background, decodes unchanged, and excludes serial", phone_dark_qr)

        # End in Light and verify the user-prefixed preference remains correct.
        def final_light_state():
            set_appearance(page, "Light")
            assert page.evaluate("document.documentElement.dataset.theme") == "light"
            assert page.evaluate("localStorage.getItem('ios26-simulator/preferences/client-video-fixture/settings.display.appearance')") == '"Light"'

        run_case("Final appearance state is Light in the user-prefixed preference namespace", final_light_state)
        context.close()
        browser.close()

    RESULTS["real_backend_accessed"] = False
    RESULTS["native_iphone_tested"] = False
    RESULTS["network_policy"] = {"api_gets_mocked": True, "non_get_requests_aborted": True, "writes": writes, "unexpected_gets": unexpected_gets}
    RESULTS["page_errors"] = page_errors
    report = {**RESULTS, "total": len(RESULTS["passed"]), "failed_total": len(RESULTS["failed"])}
    report_path = OUT / "results.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False), flush=True)
    if RESULTS["failed"] or writes or unexpected_gets or page_errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
