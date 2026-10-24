"""Focused virtual-keyboard, dialog, and landscape checks; all APIs are mocked."""
import ast
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:4177"
VALUES = {}
for node in ast.parse((ROOT / "scripts/test-client-video.py").read_text()).body:
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in ["USER", "DEVICE"]:
                VALUES[target.id] = ast.literal_eval(node.value)
RESULTS = []
with sync_playwright() as p:
    for engine in ["webkit", "chromium"]:
        browser = p.webkit.launch() if engine == "webkit" else p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        context.add_init_script("localStorage.setItem('auth_token','mock');localStorage.setItem('auth_user',%s);localStorage.setItem('cached_device',%s);" % (json.dumps(json.dumps(VALUES["USER"])), json.dumps(json.dumps(VALUES["DEVICE"]))))
        context.route("**/api/**", lambda route: route.fulfill(json=VALUES["USER"] if route.request.url.endswith("/auth/me") else VALUES["DEVICE"]) if route.request.method == "GET" else route.abort())
        page = context.new_page()
        for theme in ["Light", "Dark"]:
            page.goto(BASE + "/settings/display")
            page.get_by_test_id("appearance-" + theme.lower()).click()
            page.goto(BASE + "/settings")
            page.get_by_test_id("settings-search").wait_for()
            page.wait_for_timeout(200)
            assert page.evaluate("document.documentElement.dataset.theme") == theme.lower()
            assert page.locator(".ios-divider").first.evaluate("e=>getComputedStyle(e).backgroundColor") not in ["transparent", "rgba(0, 0, 0, 0)"]
            page.evaluate("""()=>{const v=window.visualViewport;Object.defineProperty(v,'height',{configurable:true,get:()=>450});Object.defineProperty(v,'offsetTop',{configurable:true,get:()=>0});v.dispatchEvent(new Event('resize'));}""")
            page.wait_for_timeout(100)
            field = page.locator(".ios-settings-search").bounding_box()
            assert field["y"] + field["height"] <= 450, (engine, theme, field)
            assert page.locator(".ios-navigation-page").evaluate("e=>e.clientHeight") <= 450
            page.get_by_test_id("settings-search").fill("Notifications")
            page.get_by_test_id("row-notifications").click()
            page.get_by_test_id("settings-detail-notifications").wait_for()
            page.wait_for_timeout(400)
            assert page.locator(".ios-settings-search").count() == 0
            page.evaluate("()=>{delete window.visualViewport.height;delete window.visualViewport.offsetTop;window.visualViewport.dispatchEvent(new Event('resize'));}")
            page.goto(BASE + "/wifi")
            page.get_by_test_id("wifi-other").click()
            dialog = page.get_by_role("dialog", name="Join Other Network")
            dialog.wait_for()
            dialog.get_by_role("textbox", name="Network Name").fill("Local Test Network")
            assert dialog.get_by_role("textbox").evaluate("e=>getComputedStyle(e).color") not in ["transparent", "rgba(0, 0, 0, 0)"]
            dialog.get_by_role("button", name="Close", exact=True).click()
            page.set_viewport_size({"width": 844, "height": 390})
            page.goto(BASE + "/settings")
            page.wait_for_timeout(200)
            assert page.locator(".ios-navigation-page").evaluate("e=>e.scrollWidth<=e.clientWidth")
            page.locator(".ios-navigation-page").evaluate("e=>e.scrollTop=e.scrollHeight")
            page.wait_for_timeout(150)
            row = page.get_by_test_id("row-apps").bounding_box()
            field = page.locator(".ios-settings-search").bounding_box()
            assert row["y"] + row["height"] <= field["y"]
            page.set_viewport_size({"width": 390, "height": 844})
            RESULTS.append({"engine": engine, "theme": theme, "keyboard_viewport_simulated": True, "landscape": True, "dialog_labeled": True})
            print("PASS:", engine, theme, "keyboard viewport, separator, dialog, landscape", flush=True)
        context.close()
        browser.close()
OUT = ROOT / "test_reports/keyboard-theme.json"
OUT.write_text(json.dumps({"passed": RESULTS, "physical_keyboard_tested": False, "real_backend_accessed": False}, indent=2) + "\n")
