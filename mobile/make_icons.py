"""Sync existing icon assets without redrawing or replacing their designs.
Run from any working directory: python3 mobile/make_icons.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def sync_icons():
    for app in ("phone", "settings"):
        resource = ROOT / "mobile" / app / "resources" / "icon.png"
        icon = Image.open(resource).convert("RGB")
        if icon.size != (1024, 1024):
            raise ValueError(f"{resource} must be a prepared 1024x1024 icon")
        native = ROOT / "mobile" / app / "ios" / "App" / "App" / "Assets.xcassets" / "AppIcon.appiconset" / "AppIcon-512@2x.png"
        icon.save(native, format="PNG")
        web = ROOT / "frontend" / "public" / "icons" / f"{app}.png"
        web.parent.mkdir(parents=True, exist_ok=True)
        icon.resize((256, 256), Image.Resampling.LANCZOS).save(web, format="PNG")
        print(f"Synchronized {app}: native icon + web icon")
    print("Splash artwork is retained; this script does not regenerate it.")


if __name__ == "__main__":
    sync_icons()
