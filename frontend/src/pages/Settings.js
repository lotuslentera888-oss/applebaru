import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosIcon } from "@/components/ios/IosList";
import SystemIcon from "@/components/ios/SystemIcon";
import { useAuth } from "@/context/AuthContext";
import { usePreference } from "@/lib/preferences";
import { settingsGroups } from "@/lib/settingsCatalog";
import {
  Plane, Wifi, Bluetooth, Link, Bell, Volume2, Moon, Hourglass,
  SlidersHorizontal, Sun, LayoutGrid, Accessibility, Image as ImageIcon,
  Search, Hand, KeyRound, AppWindow, Music2, User, ChevronRight, ScanFace,
  Siren, BatteryFull, Sparkles, Camera, Globe, ToggleRight, Smartphone,
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
const iconMap = { plane: Plane, wifi: Wifi, bluetooth: Bluetooth, antenna: CellularGlyph, link: Link, bell: Bell, volume: Volume2, moon: Moon, hourglass: Hourglass, sliders: SlidersHorizontal, sun: Sun, grid: LayoutGrid, accessibility: Accessibility, image: ImageIcon, hand: Hand, key: KeyRound, apps: AppWindow, appstore: AppStoreGlyph, music: Music2, face: ScanFace, siren: Siren, battery: BatteryFull, sparkles: Sparkles, camera: Camera, circle: ToggleRight, shield: Globe };

function Toggle({ value, onChange }) {
  return <button type="button" role="switch" aria-label="Airplane Mode" aria-checked={value} onClick={() => onChange(!value)} className={`w-[51px] h-[31px] rounded-full relative transition-colors ${value ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}><span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-all ${value ? "left-[22px]" : "left-[2px]"}`} /></button>;
}
function SettingRow({ item, navigate, connectivity }) {
  const { airplane, setAirplane, wifiEnabled, connected, bluetooth, hotspot } = connectivity;
  const summary = item.key === "wifi" ? (wifiEnabled ? connected : "") : item.key === "bluetooth" ? (bluetooth ? "On" : "Off") : item.key === "hotspot" ? (hotspot ? "On" : "Off") : undefined;
  if (item.key === "airplane") return <IosRow icon={<IosIcon color={item.color}><SystemIcon name="plane" fallback={Plane} /></IosIcon>} label={item.label} value={<Toggle value={airplane} onChange={setAirplane} />} chevron={false} testId="row-airplane" />;
  const Icon = iconMap[item.icon] || Smartphone;
  const glyph = ["bluetooth", "appstore"].includes(item.icon) ? <Icon size={22} strokeWidth={2.1} /> : <SystemIcon name={item.icon} fallback={Icon} />;
  const icon = item.key === "general" ? <div className="ios-icon w-[32px] h-[32px] rounded-[8px] overflow-hidden mr-3 shrink-0"><img src="/icons/settings.png" alt="" className="h-full w-full object-cover" /></div> : <IosIcon color={item.color}>{glyph}</IosIcon>;
  const target = item.key === "wifi" ? "/wifi" : item.key === "bluetooth" ? "/bluetooth" : item.key === "general" ? "/general" : `/settings/${item.key}`;
  return <IosRow icon={icon} label={item.label} value={summary} onClick={() => navigate(target)} testId={`row-${item.key}`} />;
}
export default function Settings() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [displayName] = usePreference("account.displayName", auth?.username || "Apple Account");
  const [airplane, setAirplane] = usePreference("settings.airplane.enabled", false);
  const [wifiEnabled] = usePreference("connectivity.wifi.enabled", true);
  const [connected] = usePreference("connectivity.wifi.connected", "");
  const [bluetooth] = usePreference("connectivity.bluetooth.enabled", true);
  const [hotspot] = usePreference("settings.hotspot.enabled", false);
  const connectivity = { airplane, setAirplane, wifiEnabled, connected, bluetooth, hotspot };
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => settingsGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(normalized)) })).filter((group) => group.items.length), [normalized]);
  return <div className="pb-8" data-testid="settings-home">
    <NavHeader largeTitle="Settings" />
    <div className="px-4 pb-3 pt-2 bg-white"><label className="flex items-center gap-2 bg-[#EFEFF0] rounded-[12px] px-3 h-[36px] text-[#8E8E93]"><Search size={18} strokeWidth={2} /><input data-testid="settings-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search Settings" className="w-full bg-transparent text-[17px] outline-none placeholder:text-[#8E8E93]" /></label></div>
    <div className="mx-4 mb-5 mt-3">
      <button type="button" data-testid="apple-id-row" onClick={() => navigate("/account")} className="w-full flex items-center gap-3 bg-white rounded-[20px] px-4 py-3.5 text-left active:bg-[#D1D1D6]/60 transition-colors">
        <span className="w-[56px] h-[56px] rounded-full bg-gradient-to-b from-[#C7C7CC] to-[#8E8E93] flex items-center justify-center text-white shrink-0"><User size={31} strokeWidth={1.7} /></span>
        <span className="min-w-0"><span className="block text-[19px] font-semibold text-black leading-6 truncate">{displayName || "Apple Account"}</span><span className="block text-[13px] text-[#6D6D72] leading-[18px] mt-0.5">Apple Account, iCloud, and more</span></span>
        <ChevronRight className="text-[#C6C6C8] ml-auto shrink-0" size={17} strokeWidth={2.2} />
      </button>
    </div>
    {visibleGroups.length ? <div className="space-y-5">{visibleGroups.map((group) => <IosGroup key={group.id}>{group.items.map((item) => <SettingRow key={item.key} item={item} navigate={navigate} connectivity={connectivity} />)}</IosGroup>)}</div> : <div className="px-8 pt-12 text-center text-[15px] text-[#6D6D72]">Tidak ada pengaturan yang cocok.</div>}
  </div>;
}
