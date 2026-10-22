import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosIcon } from "@/components/ios/IosList";
import { useDevice } from "@/context/DeviceContext";
import { usePreference } from "@/lib/preferences";
import { settingsGroups } from "@/lib/settingsCatalog";
import {
  Plane, Wifi, Bluetooth, Antenna, Link, Bell, Volume2, Moon, Hourglass,
  SlidersHorizontal, Sun, LayoutGrid, Accessibility, Image as ImageIcon,
  Search, Hand, KeyRound, AppWindow, Music2, User, ChevronRight, ScanFace,
  Siren, BatteryFull, Sparkles, Camera, Globe, ToggleRight, Smartphone,
} from "lucide-react";

function AppStoreGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M8 4L18.5 21M16 4L5.5 21M3 16H21" /></svg>;
}
const iconMap = { plane: Plane, wifi: Wifi, bluetooth: Bluetooth, antenna: Antenna, link: Link, bell: Bell, volume: Volume2, moon: Moon, hourglass: Hourglass, sliders: SlidersHorizontal, sun: Sun, grid: LayoutGrid, accessibility: Accessibility, image: ImageIcon, hand: Hand, key: KeyRound, apps: AppWindow, appstore: AppStoreGlyph, music: Music2, face: ScanFace, siren: Siren, battery: BatteryFull, sparkles: Sparkles, camera: Camera, circle: ToggleRight, shield: Globe };

function Toggle({ value, onChange }) {
  return <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`w-[51px] h-[31px] rounded-full relative transition-colors ${value ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}><span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-all ${value ? "left-[22px]" : "left-[2px]"}`} /></button>;
}

function SettingRow({ item, navigate }) {
  const [airplane, setAirplane] = usePreference("settings.airplane.enabled", false);
  const [wifiEnabled] = usePreference("connectivity.wifi.enabled", true);
  const [connected] = usePreference("connectivity.wifi.connected", "");
  const [bluetooth] = usePreference("connectivity.bluetooth.enabled", true);
  const [hotspot] = usePreference("settings.hotspot.enabled", false);
  const summary = item.key === "wifi" ? (wifiEnabled ? connected : "") : item.key === "bluetooth" ? (bluetooth ? "On" : "Off") : item.key === "hotspot" ? (hotspot ? "On" : "Off") : undefined;
  if (item.key === "airplane") return <IosRow icon={<IosIcon color={item.color}><Plane size={17} strokeWidth={2} /></IosIcon>} label={item.label} value={<Toggle value={airplane} onChange={setAirplane} />} chevron={false} testId="row-airplane" />;
  const Icon = iconMap[item.icon] || Smartphone;
  const icon = item.key === "general" ? <div className="ios-icon w-[34px] h-[34px] rounded-[9px] overflow-hidden mr-3 shrink-0"><img src="/icons/settings.png" alt="" className="h-full w-full object-cover" /></div> : <IosIcon color={item.color}><Icon size={17} strokeWidth={2.1} /></IosIcon>;
  return <IosRow icon={icon} label={item.label} value={summary} onClick={() => navigate(item.key === "wifi" ? "/wifi" : item.key === "bluetooth" ? "/bluetooth" : item.key === "general" ? "/general" : `/settings/${item.key}`)} testId={`row-${item.key}`} />;
}

export default function Settings() {
  const navigate = useNavigate();
  const { device } = useDevice();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => settingsGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(normalized)) })).filter((group) => group.items.length), [normalized]);
  return <div className="pb-10" data-testid="settings-home">
    <NavHeader largeTitle="Settings" />
    <div className="px-4 pb-3"><label className="flex items-center gap-2 bg-white/80 rounded-full px-4 h-11 text-[#8E8E93]"><Search size={18} strokeWidth={2.2} /><input data-testid="settings-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search Settings" className="w-full bg-transparent text-[17px] outline-none placeholder:text-[#8E8E93]" /></label></div>
    <div className="mx-4 mb-6"><div data-testid="apple-id-row" onClick={() => navigate("/edit")} className="flex items-center gap-3.5 bg-white rounded-[24px] px-4 py-4 cursor-pointer active:bg-[#D1D1D6]/60 transition-colors"><div className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#B0B0B8] to-[#8E8E93] flex items-center justify-center text-white shrink-0"><User size={34} strokeWidth={1.6} /></div><div className="min-w-0"><div className="text-[19px] font-semibold text-black leading-tight">{device?.device_name || "iPhone"}</div><div className="text-[13px] text-[#8E8E93] leading-tight mt-0.5">Device Info, IMEI, Serial &amp; more</div></div><ChevronRight className="text-[#C6C6C8] ml-auto shrink-0" size={19} strokeWidth={2.4} /></div></div>
    {visibleGroups.length ? <div className="space-y-6">{visibleGroups.map((group) => <IosGroup key={group.id}>{group.items.map((item) => <SettingRow key={item.key} item={item} navigate={navigate} />)}</IosGroup>)}</div> : <div className="px-8 pt-12 text-center text-[15px] text-[#6D6D72]">Tidak ada pengaturan yang cocok.</div>}
  </div>;
}
