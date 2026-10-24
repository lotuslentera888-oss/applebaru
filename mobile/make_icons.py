"""Synchronize native icon sizes without drawing, recoloring, or enhancing icons."""
from pathlib import Path
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def sync_icons():
    for app in ("phone", "settings"):
        resource = ROOT / "mobile" / app / "resources" / "icon.png"
        exact = resource.with_name("icon-source-exact.png")
        web = ROOT / "frontend/public/icons" / f"{app}.png"
        web.parent.mkdir(parents=True, exist_ok=True)
        if app == "settings" and exact.is_file():
            original = Image.open(exact).convert("RGB")
            # iOS requires 1024x1024. This is size conversion only, not restoration.
            icon = original.resize((1024, 1024), Image.Resampling.LANCZOS)
            icon.save(resource, format="PNG")
            shutil.copyfile(exact, web)
        else:
            icon = Image.open(resource).convert("RGB")
            if icon.size != (1024, 1024):
                raise ValueError(f"{resource} must be a prepared 1024x1024 icon")
            icon.resize((256, 256), Image.Resampling.LANCZOS).save(web, format="PNG")
        native = ROOT / "mobile" / app / "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
        icon.save(native, format="PNG")
        print(f"Synchronized {app}: native + source-preserving web icon")
    print("No shapes, colors, or splash artwork are regenerated.")


if __name__ == "__main__":
    sync_icons()
