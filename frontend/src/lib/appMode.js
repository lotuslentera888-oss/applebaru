// Build-time app identity. Set REACT_APP_CAP_APP=settings|phone when building the
// Capacitor iOS apps. Defaults to "full" for the web app (launcher with both apps).
export const APP_MODE = process.env.REACT_APP_CAP_APP || "full";
export const isSettingsApp = APP_MODE === "settings";
export const isPhoneApp = APP_MODE === "phone";
export const isFullApp = APP_MODE === "full";

export function userHomePath() {
  if (isSettingsApp) return "/settings";
  if (isPhoneApp) return "/phone";
  return "/apps";
}
