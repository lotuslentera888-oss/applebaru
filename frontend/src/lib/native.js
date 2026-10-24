import { Capacitor, registerPlugin } from "@capacitor/core";

export const isNative = typeof Capacitor?.isNativePlatform === "function" ? Capacitor.isNativePlatform() : false;
const NativeAppearance = registerPlugin("SimulatorAppearance");
let ready;
let updateQueue = Promise.resolve();
let revision = 0;

export function initNative() {
  if (!isNative) return Promise.resolve();
  if (ready) return ready;
  document.documentElement.dataset.native = "true";
  ready = (async () => {
    try {
      const { StatusBar, Animation } = await import("@capacitor/status-bar");
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.show({ animation: Animation.None });
    } catch (error) {
      console.warn("Native status bar configuration unavailable", error?.message);
    }
    try {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide();
    } catch {
      // Older wrappers may not expose the splash plugin.
    }
  })();
  return ready;
}

export function syncNativeAppearance(appearance, mode) {
  if (!isNative) return Promise.resolve();
  const requested = ++revision;
  updateQueue = updateQueue.catch(() => {}).then(async () => {
    await initNative();
    if (requested !== revision) return;
    await NativeAppearance.setAppearance({ mode: appearance.toLowerCase() });
    if (requested !== revision) return;
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // LIGHT = dark icons on light UI; DARK = light icons on dark UI.
    await StatusBar.setStyle({ style: mode === "dark" ? Style.Dark : Style.Light });
  });
  return updateQueue;
}
