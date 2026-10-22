import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosSectionFooter } from "@/components/ios/IosList";
import { generalGroups } from "@/lib/settingsCatalog";
import { Search, X } from "lucide-react";

function SimulatedDialog({ title, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-8" role="dialog" aria-modal="true"><div className="w-full max-w-[340px] rounded-[18px] bg-white p-5 shadow-2xl"><h2 className="text-[18px] font-semibold">{title}</h2><p className="mt-3 text-[15px] leading-5 text-[#6D6D72]">Ini hanya dialog simulasi. Tidak ada data yang dihapus dan tidak ada perangkat eksternal yang dimatikan.</p><button type="button" onClick={onClose} className="mt-5 w-full rounded-[12px] bg-[#007AFF] py-2.5 text-[16px] font-semibold text-white">Mengerti</button></div></div>;
}

export default function General() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState("");
  const normalized = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => generalGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(normalized)) })).filter((group) => group.items.length), [normalized]);
  const open = (item) => {
    if (item.route) navigate(item.route);
    else navigate(`/general/${item.key}`);
  };
  return <div className="pb-10" data-testid="general-page">
    <NavHeader title="General" largeTitle="General" onBack={() => navigate("/settings")} backLabel="Settings" />
    <div className="px-4 pb-3"><label className="flex items-center gap-2 bg-[#E3E3E9] rounded-[10px] px-2.5 h-9 text-[#8E8E93]"><Search size={18} /><input data-testid="general-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search General" className="w-full bg-transparent text-[17px] outline-none placeholder:text-[#8E8E93]" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</label></div>
    <div className="space-y-6 pt-1">{visibleGroups.map((group) => <IosGroup key={group.id}>{group.items.map((item) => <IosRow key={item.key} label={item.label} labelClass={item.labelClass} onClick={() => open(item)} chevron testId={`row-${item.key}`} />)}</IosGroup>)}</div>
    {!visibleGroups.length && <div className="px-8 pt-12 text-center text-[15px] text-[#6D6D72]">Tidak ada pengaturan yang cocok.</div>}
    <IosSectionFooter>Pengaturan ini hanya memengaruhi simulasi lokal. About dan editor perangkat tetap tersedia.</IosSectionFooter>
    {dialog && <SimulatedDialog title={dialog} onClose={() => setDialog("")} />}
  </div>;
}
