// Data-only catalogue: pages render this schema instead of repeating one-off toast handlers.
export const settingsGroups = [
  {
    id: "connectivity",
    items: [
      { key: "airplane", label: "Airplane Mode", icon: "plane", color: "#FF9500", controls: [{ type: "toggle", key: "enabled", label: "Airplane Mode", defaultValue: false }] },
      { key: "wifi", label: "Wi-Fi", icon: "wifi", color: "#0A84FF", summaryKey: "connectivity.wifi.connected" },
      { key: "bluetooth", label: "Bluetooth", icon: "bluetooth", color: "#0A84FF", summaryKey: "connectivity.bluetooth.enabled" },
      { key: "cellular", label: "Cellular", icon: "antenna", color: "#34C759", controls: [{ type: "select", key: "voice", label: "Voice & Data", defaultValue: "5G Auto", options: ["5G Auto", "5G On", "LTE"] }, { type: "toggle", key: "data", label: "Cellular Data", defaultValue: true }] },
      { key: "hotspot", label: "Personal Hotspot", icon: "link", color: "#34C759", controls: [{ type: "toggle", key: "enabled", label: "Allow Others to Join", defaultValue: false }, { type: "select", key: "compatibility", label: "Maximize Compatibility", defaultValue: "Off", options: ["Off", "On"] }] },
      { key: "battery", label: "Battery", icon: "battery", color: "#34C759", controls: [{ type: "toggle", key: "percentage", label: "Battery Percentage", defaultValue: true }, { type: "toggle", key: "optimized", label: "Optimized Battery Charging", defaultValue: true }] },
    ],
  },
  {
    id: "appearance",
    items: [
      { key: "general", label: "General", icon: "general", color: "#8E8E93", route: "/general" },
      { key: "accessibility", label: "Accessibility", icon: "accessibility", color: "#007AFF", controls: [{ type: "toggle", key: "voiceOver", label: "VoiceOver", defaultValue: false }, { type: "toggle", key: "zoom", label: "Zoom", defaultValue: false }, { type: "toggle", key: "motion", label: "Reduce Motion", defaultValue: false }, { type: "select", key: "text", label: "Display Text Size", defaultValue: "Default", options: ["Default", "Larger", "Largest"] }] },
      { key: "action-button", label: "Action Button", icon: "action-button", color: "#007AFF", controls: [{ type: "select", key: "action", label: "Press and Hold", defaultValue: "Silent Mode", options: ["Silent Mode", "Focus", "Camera", "Flashlight", "Voice Memo", "No Action"] }] },
      { key: "apple-intelligence", label: "Apple Intelligence & Siri", icon: "apple-intelligence", color: "#AF52DE", controls: [{ type: "toggle", key: "intelligence", label: "Apple Intelligence", defaultValue: false }, { type: "toggle", key: "listen", label: "Listen for Hey Siri", defaultValue: false }], note: "Simulasi UI lokal; tidak terhubung ke layanan Apple." },
      { key: "camera", label: "Camera", icon: "camera", color: "#8E8E93", controls: [{ type: "toggle", key: "grid", label: "Grid", defaultValue: false }, { type: "toggle", key: "scan", label: "Scan QR Codes", defaultValue: true }, { type: "select", key: "format", label: "Camera Capture", defaultValue: "High Efficiency", options: ["High Efficiency", "Most Compatible"] }] },
      { key: "control-center", label: "Control Center", icon: "circle", color: "#8E8E93", controls: [{ type: "toggle", key: "access", label: "Access Within Apps", defaultValue: true }, { type: "select", key: "layout", label: "Layout", defaultValue: "Connected", options: ["Connected", "Expanded"] }] },
      { key: "display", label: "Display & Brightness", icon: "sun", color: "#007AFF", controls: [{ type: "select", key: "appearance", label: "Appearance", defaultValue: "Light", options: ["Light", "Dark", "Automatic"] }, { type: "slider", key: "brightness", label: "Brightness", defaultValue: 78, min: 10, max: 100 }, { type: "toggle", key: "trueTone", label: "True Tone", defaultValue: true }] },
      { key: "home-screen", label: "Home Screen & App Library", icon: "grid", color: "#1E6FFF", controls: [{ type: "select", key: "newApps", label: "Newly Downloaded Apps", defaultValue: "App Library Only", options: ["Add to Home Screen", "App Library Only"] }, { type: "toggle", key: "badges", label: "Show in App Library", defaultValue: true }] },
      { key: "search", label: "Search", icon: "search", color: "#8E8E93", controls: [{ type: "toggle", key: "suggestions", label: "Show in Search", defaultValue: true }, { type: "select", key: "results", label: "Search Results", defaultValue: "All Apps", options: ["All Apps", "Apps Only", "Off"] }] },
      { key: "standby", label: "StandBy", icon: "standby", color: "#1C1C1E", controls: [{ type: "toggle", key: "enabled", label: "StandBy", defaultValue: true }, { type: "select", key: "nightMode", label: "Night Mode", defaultValue: "Automatic", options: ["Automatic", "Always On", "Off"] }] },
      { key: "wallpaper", label: "Wallpaper", icon: "image", color: "#30B0C7", controls: [{ type: "select", key: "lock", label: "Lock Screen", defaultValue: "Colorful Gradient", options: ["Colorful Gradient", "Solar", "Blue Dunes"] }, { type: "select", key: "home", label: "Home Screen", defaultValue: "Colorful Gradient", options: ["Colorful Gradient", "Blurred", "Solid Color"] }] },
    ],
  },
  {
    id: "alerts",
    items: [
      { key: "notifications", label: "Notifications", icon: "bell", color: "#FF3B30", controls: [{ type: "toggle", key: "summaries", label: "Scheduled Summary", defaultValue: false }, { type: "select", key: "preview", label: "Show Previews", defaultValue: "When Unlocked", options: ["Always", "When Unlocked", "Never"] }] },
      { key: "sounds", label: "Sounds & Haptics", icon: "volume", color: "#FF2D55", controls: [{ type: "slider", key: "volume", label: "Ringtone and Alerts", defaultValue: 65, min: 0, max: 100 }, { type: "toggle", key: "keyboard", label: "Keyboard Feedback", defaultValue: true }] },
      { key: "focus", label: "Focus", icon: "moon", color: "#5E5CE6", controls: [{ type: "select", key: "mode", label: "Current Focus", defaultValue: "Do Not Disturb", options: ["Do Not Disturb", "Personal", "Work", "Off"] }, { type: "toggle", key: "share", label: "Share Focus Status", defaultValue: true }] },
      { key: "screen-time", label: "Screen Time", icon: "hourglass", color: "#5856D6", controls: [{ type: "toggle", key: "limits", label: "App & Website Activity", defaultValue: true }, { type: "slider", key: "dailyLimit", label: "Daily Limit (minutes)", defaultValue: 120, min: 15, max: 480, step: 15 }] },
    ],
  },
  {
    id: "privacy",
    items: [
      { key: "face-id", label: "Face ID & Passcode", icon: "face", color: "#34C759", controls: [{ type: "toggle", key: "unlock", label: "iPhone Unlock", defaultValue: true }, { type: "toggle", key: "itunes", label: "iTunes & App Store", defaultValue: true }, { type: "action", key: "passcode", label: "Change Passcode", actionLabel: "Simulate" }], note: "Tidak meminta atau memvalidasi Face ID/passcode asli." },
      { key: "emergency-sos", label: "Emergency SOS", icon: "siren", color: "#FF3B30", controls: [{ type: "toggle", key: "callHold", label: "Call with Hold", defaultValue: true }, { type: "toggle", key: "callFive", label: "Call with 5 Presses", defaultValue: true }, { type: "action", key: "demo", label: "Emergency SOS Demo", actionLabel: "Preview" }], note: "Demo tidak menelepon layanan darurat." },
      { key: "privacy", label: "Privacy & Security", icon: "hand", color: "#0A84FF", controls: [{ type: "toggle", key: "tracking", label: "Allow Apps to Request to Track", defaultValue: false }, { type: "select", key: "location", label: "Location Services", defaultValue: "While Using", options: ["Never", "Ask Next Time", "While Using", "Always"] }] },
    ],
  },
  {
    id: "account",
    items: [
      { key: "game-center", label: "Game Center", icon: "game-center", color: "#5856D6", controls: [{ type: "toggle", key: "enabled", label: "Game Center", defaultValue: true }, { type: "toggle", key: "friendRequests", label: "Allow Friend Requests", defaultValue: true }] },
      { key: "icloud", label: "iCloud", icon: "cloud", color: "#007AFF", route: "/account/icloud" },
      { key: "wallet", label: "Wallet", icon: "wallet", color: "#1C1C1E", controls: [{ type: "toggle", key: "payments", label: "Allow Payments on iPhone", defaultValue: true }, { type: "select", key: "defaultCard", label: "Default Card", defaultValue: "No Card", options: ["No Card", "Demo Card"] }] },
    ],
  },
  {
    id: "apps",
    items: [
      { key: "apps", label: "Apps", icon: "apps", color: "#5856D6", controls: [{ type: "select", key: "defaultBrowser", label: "Default Browser App", defaultValue: "Safari (simulasi)", options: ["Safari (simulasi)", "Browser lain (simulasi)"] }, { type: "toggle", key: "updates", label: "Automatic Updates", defaultValue: true }] },
    ],
  },
];

// These controls are kept out of the primary home-page order, but remain routable and discoverable
// through findSetting for older links and simulator states.
export const legacySettingsGroups = [
  {
    id: "legacy-apps",
    items: [
      { key: "vpn", label: "VPN", icon: "shield", color: "#5856D6", controls: [{ type: "toggle", key: "connected", label: "VPN", defaultValue: false }, { type: "info", label: "No VPN configuration is installed in this simulator." }] },
      { key: "app-store", label: "App Store", icon: "appstore", color: "#0A84FF", controls: [{ type: "toggle", key: "updates", label: "App Updates", defaultValue: true }, { type: "toggle", key: "downloads", label: "Automatic Downloads", defaultValue: false }] },
      { key: "passwords", label: "Passwords", icon: "key", color: "#8E8E93", controls: [{ type: "toggle", key: "autofill", label: "AutoFill Passwords", defaultValue: true }, { type: "info", label: "No real credentials are stored by this simulator." }] },
      { key: "music", label: "Music", icon: "music", color: "#FA2D48", controls: [{ type: "toggle", key: "cellular", label: "Cellular Data", defaultValue: false }, { type: "select", key: "quality", label: "Audio Quality", defaultValue: "High Quality", options: ["High Quality", "Lossless (simulasi)"] }] },
    ],
  },
];

export const generalGroups = [
  { id: "about", items: [{ key: "about", label: "About", route: "/about" }, { key: "software-update", label: "Software Update", controls: [{ type: "info", label: "iOS configuration shown from this simulator; firmware is never downloaded." }, { type: "action", key: "check", label: "Check for Update", actionLabel: "Simulate" }] }] },
  { id: "sharing", items: [
    { key: "airdrop", label: "AirDrop", controls: [{ type: "select", key: "receiving", label: "Receiving", defaultValue: "Contacts Only", options: ["Receiving Off", "Contacts Only", "Everyone for 10 Minutes"] }] },
    { key: "airplay", label: "AirPlay & Handoff", controls: [{ type: "toggle", key: "handoff", label: "Handoff", defaultValue: true }, { type: "toggle", key: "airplay", label: "AirPlay Receiver", defaultValue: false }] },
    { key: "picture", label: "Picture in Picture", controls: [{ type: "toggle", key: "automatic", label: "Start PiP Automatically", defaultValue: true }] },
    { key: "carplay", label: "CarPlay", controls: [{ type: "info", label: "No vehicle is connected in this simulator." }, { type: "action", key: "pair", label: "Connect a Vehicle", actionLabel: "Simulate" }] },
  ] },
  { id: "storage", items: [{ key: "storage", label: "iPhone Storage" }, { key: "background-refresh", label: "Background App Refresh", controls: [{ type: "select", key: "refresh", label: "Background App Refresh", defaultValue: "Wi-Fi & Cellular Data", options: ["Off", "Wi-Fi", "Wi-Fi & Cellular Data"] }] }] },
  { id: "locale", items: [
    { key: "date-time", label: "Date & Time", controls: [{ type: "toggle", key: "automatic", label: "Set Automatically", defaultValue: true }, { type: "select", key: "format", label: "24-Hour Time", defaultValue: "On", options: ["On", "Off"] }] },
    { key: "keyboard", label: "Keyboard", controls: [{ type: "toggle", key: "auto-correction", label: "Auto-Correction", defaultValue: true }, { type: "toggle", key: "predictive", label: "Predictive", defaultValue: true }] },
    { key: "fonts", label: "Fonts", controls: [{ type: "info", label: "Installed fonts are display-only in this simulator." }, { type: "action", key: "catalog", label: "Browse Font Catalog", actionLabel: "Preview" }] },
    { key: "language-region", label: "Language & Region", controls: [{ type: "select", key: "language", label: "iPhone Language", defaultValue: "English", options: ["English", "Bahasa Indonesia"] }, { type: "select", key: "region", label: "Region", defaultValue: "Indonesia", options: ["Indonesia", "United States", "Singapore"] }] },
    { key: "dictionary", label: "Dictionary", controls: [{ type: "toggle", key: "define", label: "Define", defaultValue: true }] },
  ] },
  { id: "management", items: [{ key: "vpn-management", label: "VPN & Device Management", controls: [{ type: "info", label: "No profiles or VPN configurations are installed." }, { type: "action", key: "profile", label: "Add Configuration Profile", actionLabel: "Simulate" }] }] },
  { id: "legal", items: [{ key: "legal", label: "Legal & Regulatory", controls: [{ type: "info", label: "This is a local UI simulation. No legal agreements are changed." }, { type: "action", key: "licenses", label: "Open Licenses", actionLabel: "View" }] }] },
  { id: "reset", items: [{ key: "transfer-reset", label: "Transfer or Reset iPhone", controls: [{ type: "action", key: "transfer", label: "Prepare for New iPhone", actionLabel: "Simulate" }, { type: "action", key: "reset", label: "Erase All Content and Settings", actionLabel: "Preview" }], note: "Tidak ada data perangkat nyata yang dihapus." }, { key: "shutdown", label: "Shut Down", labelClass: "text-[#007AFF]", controls: [{ type: "action", key: "shutdown", label: "Shut Down", actionLabel: "Preview" }], note: "Shutdown hanya dialog simulasi; aplikasi tetap berjalan." }] },
];

export const flattenSettings = (groups) => groups.flatMap((group) => group.items);
export const settingsCatalog = [...flattenSettings(settingsGroups), ...flattenSettings(legacySettingsGroups)];
export const legacySettingsCatalog = flattenSettings(legacySettingsGroups);
export const generalCatalog = flattenSettings(generalGroups);
export function findSetting(key, general = false) {
  return (general ? generalCatalog : settingsCatalog).find((item) => item.key === key);
}
