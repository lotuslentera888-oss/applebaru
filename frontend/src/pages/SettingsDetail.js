import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosInfoRow, IosSectionFooter } from "@/components/ios/IosList";
import { useDevice } from "@/context/DeviceContext";
import { usePreference } from "@/lib/preferences";
import { findSetting } from "@/lib/settingsCatalog";
import { Check, ChevronRight, Info, ShieldCheck } from "lucide-react";

function Toggle({ value, onChange, testId }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(value)}
      data-testid={testId}
      onClick={() => onChange(!value)}
      className={`w-[51px] h-[31px] rounded-full relative transition-colors shrink-0 ${value ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}
    >
      <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-all ${value ? "left-[22px]" : "left-[2px]"}`} />
    </button>
  );
}

function SimulatedDialog({ title, note, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-[340px] rounded-[18px] bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-[18px] font-semibold"><ShieldCheck size={20} className="text-[#007AFF]" />{title}</div>
        <p className="mt-3 text-[15px] leading-5 text-[#6D6D72]">{note || "Perubahan ini hanya tersimpan di simulator dan tidak memanggil layanan perangkat nyata."}</p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-[12px] bg-[#007AFF] py-2.5 text-[16px] font-semibold text-white">Mengerti</button>
      </div>
    </div>
  );
}

function PreferenceControl({ settingKey, control, onAction }) {
  const prefKey = `${settingKey}.${control.key || "info"}`;
  const [value, setValue] = usePreference(prefKey, control.defaultValue);
  if (control.type === "info") {
    return <div className="flex items-start gap-2 px-4 py-3 text-[14px] leading-5 text-[#6D6D72]"><Info size={17} className="mt-0.5 shrink-0 text-[#8E8E93]" />{control.label}</div>;
  }
  if (control.type === "toggle") {
    return <div className="flex min-h-[44px] items-center justify-between gap-4 px-4 py-2"><span className="text-[17px] text-black">{control.label}</span><Toggle value={Boolean(value)} onChange={setValue} testId={`pref-${prefKey}`} /></div>;
  }
  if (control.type === "select") {
    return <label className="flex min-h-[44px] items-center justify-between gap-4 px-4 py-2"><span className="text-[17px] text-black">{control.label}</span><select aria-label={control.label} data-testid={`pref-${prefKey}`} value={value} onChange={(event) => setValue(event.target.value)} className="max-w-[190px] truncate bg-transparent text-right text-[17px] text-[#8E8E93] outline-none"><option disabled={false} value={value}>{value}</option>{control.options.filter((option) => option !== value).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  }
  if (control.type === "slider") {
    return <label className="block px-4 py-3"><div className="mb-2 flex items-center justify-between gap-4"><span className="text-[17px] text-black">{control.label}</span><span className="text-[15px] text-[#8E8E93]">{value}</span></div><input aria-label={control.label} data-testid={`pref-${prefKey}`} type="range" min={control.min ?? 0} max={control.max ?? 100} step={control.step ?? 1} value={value} onChange={(event) => setValue(Number(event.target.value))} className="w-full accent-[#007AFF]" /></label>;
  }
  if (control.type === "action") {
    return <button type="button" onClick={() => onAction(control.label)} className="flex min-h-[44px] w-full items-center justify-between px-4 py-2 text-left active:bg-[#D1D1D6]/60"><span className="text-[17px] text-[#007AFF]">{control.label}</span><span className="flex items-center gap-1 text-[15px] text-[#8E8E93]">{control.actionLabel || "Preview"}<ChevronRight size={18} /></span></button>;
  }
  return null;
}

function StorageDetail({ device }) {
  const format = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    const text = String(value);
    const match = text.match(/^([\d.]+)\s*(GB|MB|TB)?$/i);
    if (!match) return text;
    return `${match[1]} ${match[2] || "GB"}`;
  };
  return <div className="space-y-6 pt-1">
    <IosGroup><IosInfoRow label="Capacity" value={format(device?.capacity)} /><IosInfoRow label="Available" value={format(device?.available)} /></IosGroup>
    <IosGroup><IosInfoRow label="Photos" value={device?.photos ?? "—"} /><IosInfoRow label="Applications" value={device?.applications ?? "—"} /><IosInfoRow label="Videos" value={device?.videos ?? "—"} /><IosInfoRow label="Songs" value={device?.songs ?? "—"} /></IosGroup>
    <IosSectionFooter>Breakdown di bawah adalah contoh tampilan simulator; tidak memindai penyimpanan host.</IosSectionFooter>
    <IosGroup><IosInfoRow label="iOS System (contoh)" value="12.4 GB" /><IosInfoRow label="System Data (contoh)" value="8.1 GB" /><IosInfoRow label="Available (data perangkat)" value={format(device?.available)} /></IosGroup>
  </div>;
}

export default function SettingsDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { device } = useDevice();
  const isGeneral = location.pathname.startsWith("/general/");
  const base = isGeneral ? "/general" : "/settings";
  const keyParam = params.key || "";
  const section = params.section || "";
  const nested = params["*"] || "";
  const key = nested ? nested.split("/")[0] : (keyParam || section);
  // A nested choice may be represented by a route suffix supplied by the parent;
  // render the section schema while preserving that section as the back target.
  const setting = findSetting(key, isGeneral) || findSetting(section, isGeneral);
  const parent = nested ? `${base}/${section}` : base;
  const [dialog, setDialog] = useState("");

  if (!setting) {
    return <div className="pb-10"><NavHeader title="Settings" onBack={() => navigate(parent)} backLabel={isGeneral ? "General" : "Settings"} /><div className="px-6 pt-12 text-center text-[#6D6D72]">Halaman simulasi tidak tersedia.</div></div>;
  }

  if (key === "storage") {
    return <div className="pb-10" data-testid="settings-detail-storage"><NavHeader title={setting.label} largeTitle={setting.label} onBack={() => navigate(parent)} backLabel={isGeneral ? "General" : "Settings"} /><StorageDetail device={device} /></div>;
  }

  const hasControls = setting.controls?.length;
  return <div className="pb-10" data-testid={`settings-detail-${setting.key}`}>
    <NavHeader title={setting.label} largeTitle={setting.label} onBack={() => navigate(parent)} backLabel={isGeneral ? "General" : "Settings"} />
    <div className="space-y-6 pt-1">
      {setting.key === "software-update" && <IosGroup><IosInfoRow label="iOS Version" value={device?.ios_version || "—"} /><IosInfoRow label="Build" value={device?.build_version || "—"} /></IosGroup>}
      {setting.key === "battery" && <IosGroup><IosInfoRow label="Maximum Capacity" value={device?.battery_max_capacity || "—"} /><IosInfoRow label="Cycle Count" value={device?.battery_charge_cycles ?? "—"} /></IosGroup>}
      {hasControls ? <IosGroup>{setting.controls.map((control) => <PreferenceControl key={`${setting.key}-${control.key || control.label}`} settingKey={`${isGeneral ? "general" : "settings"}.${setting.key}`} control={control} onAction={setDialog} />)}</IosGroup> : <IosGroup><IosInfoRow label="Status" value="Tersedia di simulator" /><IosInfoRow label="Scope" value="Lokal akun ini" /></IosGroup>}
      {setting.note && <IosSectionFooter>{setting.note}</IosSectionFooter>}
      <IosSectionFooter><span className="inline-flex items-center gap-1"><Check size={14} /> Perubahan disimpan lokal dan tidak mengubah iOS nyata.</span></IosSectionFooter>
    </div>
    {dialog && <SimulatedDialog title={dialog} onClose={() => setDialog("")} />}
  </div>;
}
