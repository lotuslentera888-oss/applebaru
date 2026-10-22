import { Capacitor } from "@capacitor/core";

export const isNative =
  typeof Capacitor?.isNativePlatform === "function" ? Capacitor.isNativePlatform() : false;

// Configure the native shell (status bar + splash) so it feels like a real iOS app.
export async function initNative() {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark }); // dark icons for our light UI
  } catch (e) {
    /* status bar not available */
  }
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (e) {
    /* splash not available */
  }
}
