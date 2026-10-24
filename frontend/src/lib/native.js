import { Capacitor } from "@capacitor/core";

export const isNative =
  typeof Capacitor?.isNativePlatform === "function" ? Capacitor.isNativePlatform() : false;

// LIGHT means dark text for a light background. The shell owns safe insets.
export async function initNative() {
  if (!isNative) return;
  document.documentElement.dataset.native = "true";
  try {
    const { StatusBar, Style, Animation } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.show({ animation: Animation.None });
  } catch (error) {
    // Native configuration provides the same defaults as a fallback.
    console.warn("Native status bar configuration unavailable", error?.message);
  }
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    // Older embedded runtimes may not expose the splash plugin.
  }
}
