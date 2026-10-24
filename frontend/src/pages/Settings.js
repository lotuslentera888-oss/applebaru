import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosIcon } from "@/components/ios/IosList";
import SystemIcon from "@/components/ios/SystemIcon";
import { useIosSearchPortal } from "@/components/ios/Navigation";
import { useAuth } from "@/context/AuthContext";
import { usePreference } from "@/lib/preferences";
import { settingsGroups } from "@/lib/settingsCatalog";
import {
  Plane, Wifi, Bluetooth, Link, Bell, Volume2, Moon, Hourglass,
  SlidersHorizontal, Sun, LayoutGrid, Accessibility, Image as ImageIcon,
  Search as SearchIcon, Mic, Hand, KeyRound, Music2, User, ChevronRight,
  ScanFace, Siren, BatteryFull, Camera, Smartphone, Settings as SettingsIcon,
  ToggleRight, Clock3, Cloud,
} from "lucide-react";

function AppStoreGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M8 4L18.5 21M16 4L5.5 21M3 16H21" /></svg>;
}

function CellularGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M12 13v7M10 20h4M8.5 7a5 5 0 0 0 0 7M15.5 7a5 5 0 0 1 0 7M5.6 4.2a9 9 0 0 0 0 12.6M18.4 4.2a9 9 0 0 1 0 12.6" />
  </svg>;
}

function AppleIntelligenceGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs><linearGradient id="apple-intelligence-gradient" x1="3" y1="3" x2="21" y2="21"><stop stopColor="#FF375F" /><stop offset=".48" stopColor="#AF52DE" /><stop offset="1" stopColor="#0A84FF" /></linearGradient></defs>
    <path d="M12 2.8l1.5 6.1L19.7 7l-3.3 5.2 5.1 3.2-6.2.7L16.5 22 12 17.7 7.5 22l1.2-5.9-6.2-.7 5.1-3.2L4.3 7l6.2 1.9L12 2.8z" fill="url(#apple-intelligence-gradient)" />
  </svg>;
}

function AppsGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs><linearGradient id="apps-gradient-a" x1="3" y1="3" x2="21" y2="21"><stop stopColor="#0A84FF" /><stop offset="1" stopColor="#5E5CE6" /></linearGradient><linearGradient id="apps-gradient-b" x1="21" y1="3" x2="3" y2="21"><stop stopColor="#34C759" /><stop offset="1" stopColor="#30D158" /></linearGradient></defs>
    <rect x="3" y="3" width="8" height="8" rx="2.2" fill="url(#apps-gradient-a)" /><rect x="13" y="3" width="8" height="8" rx="2.2" fill="#FF9F0A" /><rect x="3" y="13" width="8" height="8" rx="2.2" fill="url(#apps-gradient-b)" /><rect x="13" y="13" width="8" height="8" rx="2.2" fill="#FF375F" />
  </svg>;
}

function GameCenterGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs><linearGradient id="game-center-gradient" x1="4" y1="4" x2="20" y2="20"><stop stopColor="#30D158" /><stop offset=".5" stopColor="#0A84FF" /><stop offset="1" stopColor="#BF5AF2" /></linearGradient></defs>
    <circle cx="8.3" cy="12" r="5.2" fill="url(#game-center-gradient)" /><circle cx="15.7" cy="12" r="5.2" fill="url(#game-center-gradient)" opacity=".86" /><path d="M8.3 9.7v4.6M6 12h4.6M15.7 10.2v3.6M13.9 12h3.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>;
}

function WalletGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs><linearGradient id="wallet-gradient" x1="3" y1="4" x2="21" y2="20"><stop stopColor="#5E5CE6" /><stop offset="1" stopColor="#AF52DE" /></linearGradient></defs>
    <path d="M4.2 6.1h13.2a2.6 2.6 0 012.6 2.6v8.1a2.6 2.6 0 01-2.6 2.6H4.2A2.2 2.2 0 012 17.2V8.3a2.2 2.2 0 012.2-2.2z" fill="url(#wallet-gradient)" />
    <path d="M4.2 6.1V4.6h11.5a2.1 2.1 0 012.1 1.5M14.1 12.2h5.4v3.3h-5.4a1.65 1.65 0 010-3.3z" stroke="white" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /><circle cx="15.1" cy="13.85" r=".65" fill="white" />
  </svg>;
}

const iconMap = {
  plane: Plane,
  wifi: Wifi,
  bluetooth: Bluetooth,
  antenna: CellularGlyph,
  link: Link,
  bell: Bell,
  volume: Volume2,
  moon: Moon,
  hourglass: Hourglass,
  sliders: SlidersHorizontal,
  sun: Sun,
  grid: LayoutGrid,
  accessibility: Accessibility,
  image: ImageIcon,
  hand: Hand,
  key: KeyRound,
  appstore: AppStoreGlyph,
  music: Music2,
  face: ScanFace,
  siren: Siren,
  battery: BatteryFull,
  camera: Camera,
  shield: Cloud,
  cloud: Cloud,
  circle: ToggleRight,
  general: SettingsIcon,
  search: SearchIcon,
  standby: Clock3,
};

const multicolorGlyphs = {
  "apple-intelligence": AppleIntelligenceGlyph,
  apps: AppsGlyph,
  "game-center": GameCenterGlyph,
  wallet: WalletGlyph,
};

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label="Airplane Mode"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="ios-toggle relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: value ? "#34C759" : "var(--ios-toggle-off)" }}
    >
      <span className={`ios-toggle-knob absolute top-[2px] h-[27px] w-[27px] rounded-full shadow transition-all ${value ? "left-[22px]" : "left-[2px]"}`} />
    </button>
  );
}

function SettingRow({ item, navigate, connectivity }) {
  const { airplane, setAirplane, wifiEnabled, connected, bluetooth, hotspot } = connectivity;
  const summary = item.key === "wifi" ? (wifiEnabled ? connected : "") : item.key === "bluetooth" ? (bluetooth ? "On" : "Off") : item.key === "hotspot" ? (hotspot ? "On" : "Off") : undefined;
  if (item.key === "airplane") return <IosRow icon={<IosIcon color={item.color}><SystemIcon name="plane" fallback={Plane} /></IosIcon>} label={item.label} value={<Toggle value={airplane} onChange={setAirplane} />} chevron={false} testId="row-airplane" />;

  const Icon = iconMap[item.icon] || Smartphone;
  const MulticolorGlyph = multicolorGlyphs[item.icon];
  const glyph = MulticolorGlyph
    ? <MulticolorGlyph />
    : ["bluetooth", "appstore"].includes(item.icon)
      ? <Icon size={22} strokeWidth={2.1} />
      : <SystemIcon name={item.icon} fallback={Icon} />;
  const referenceKeys = ["general", "action-button", "control-center", "home-screen", "standby", "apple-intelligence", "wallpaper", "game-center", "icloud", "wallet", "apps"];
  const icon = <IosIcon color={item.color}>{referenceKeys.includes(item.key) ? <img className="ios-reference-icon" src={`/icons/reference/${item.key}.png`} alt="" draggable="false" /> : glyph}</IosIcon>;
  const target = item.route || (item.key === "wifi" ? "/wifi" : item.key === "bluetooth" ? "/bluetooth" : item.key === "icloud" ? "/account/icloud" : `/settings/${item.key}`);
  const navigationState = item.key === "icloud" ? { state: { from: "/settings" } } : undefined;
  return <IosRow icon={icon} label={item.label} value={summary} onClick={() => navigate(target, navigationState)} testId={`row-${item.key}`} />;
}

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchPortal = useIosSearchPortal();
  const inputRef = useRef(null);
  const { auth } = useAuth();
  const [displayName] = usePreference("account.displayName", auth?.username || "Apple Account");
  const [airplane, setAirplane] = usePreference("settings.airplane.enabled", false);
  const [wifiEnabled] = usePreference("connectivity.wifi.enabled", true);
  const [connected] = usePreference("connectivity.wifi.connected", "");
  const [bluetooth] = usePreference("connectivity.bluetooth.enabled", true);
  const [hotspot] = usePreference("settings.hotspot.enabled", false);
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => settingsGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(normalized)) })).filter((group) => group.items.length), [normalized]);
  const connectivity = { airplane, setAirplane, wifiEnabled, connected, bluetooth, hotspot };
  const search = (
    <div className="ios-settings-search" style={{ backgroundColor: "var(--ios-search-bg)" }}>
      <SearchIcon size={18} strokeWidth={2} aria-hidden="true" style={{ color: "var(--ios-secondary)" }} />
      <input
        ref={inputRef}
        data-testid="settings-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        aria-label="Search Settings"
        className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#8E8E93]"
        style={{ color: "var(--ios-label)" }}
      />
      <button type="button" aria-label="Focus Search" onClick={() => inputRef.current?.focus()} className="shrink-0" style={{ color: "var(--ios-secondary)" }}>
        <Mic size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div className="ios-settings-home" data-testid="settings-home">
      <NavHeader largeTitle="Settings" />
      <div className="ios-settings-content">
        <div className="ios-settings-account mx-4 mb-5 mt-3">
          <button type="button" data-testid="apple-id-row" onClick={() => navigate("/account")} className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3.5 text-left transition-colors active:bg-[#D1D1D6]/60" style={{ backgroundColor: "var(--ios-surface)" }}>
            <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#C7C7CC] to-[#8E8E93] text-white"><User size={31} strokeWidth={1.7} /></span>
            <span className="min-w-0"><span className="block truncate text-[19px] font-semibold leading-6" style={{ color: "var(--ios-label)" }}>{displayName || "Apple Account"}</span><span className="mt-0.5 block text-[13px] leading-[18px]" style={{ color: "var(--ios-secondary)" }}>Apple Account, iCloud+, and more</span></span>
            <ChevronRight className="ml-auto shrink-0" size={17} strokeWidth={2.2} style={{ color: "var(--ios-secondary)" }} />
          </button>
        </div>
        {visibleGroups.length ? (
          <div className="ios-settings-group-stack">
            {visibleGroups.map((group) => (
              <div key={group.id} data-testid={`group-${group.id}`} className="ios-settings-group">
                <IosGroup>{group.items.map((item) => <SettingRow key={item.key} item={item} navigate={navigate} connectivity={connectivity} />)}</IosGroup>
              </div>
            ))}
          </div>
        ) : <div className="px-8 pt-12 text-center text-[15px]" style={{ color: "var(--ios-secondary)" }}>Tidak ada pengaturan yang cocok.</div>}
      </div>
      {location.pathname === "/settings" && (searchPortal ? createPortal(search, searchPortal) : search)}
    </div>
  );
}
