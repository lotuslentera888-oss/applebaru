import React from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosSectionHeader, IosSectionFooter } from "@/components/ios/IosList";
import OfflineBanner from "@/components/ios/OfflineBanner";
import { usePreference } from "@/lib/preferences";
import { Bluetooth, Info, Loader2, Check } from "lucide-react";

function Toggle({ on, onClick, testId }) { return <button type="button" role="switch" aria-checked={on} data-testid={testId} onClick={() => onClick(!on)} className={`w-[51px] h-[31px] rounded-full relative transition-colors ${on ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}><span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-all ${on ? "left-[22px]" : "left-[2px]"}`} /></button>; }

const MY_DEVICES = ["AirPods Pro", "Apple Watch Series 9", "Andi's MacBook Pro"];
const OTHER_DEVICES = ["JBL Flip 6", "Mi Band 8", "Car Audio", "Sony WH-1000XM5"];

export default function BluetoothPage() {
  const navigate = useNavigate();
  const [on, setOn] = usePreference("connectivity.bluetooth.enabled", true);
  const [paired, setPaired] = usePreference("connectivity.bluetooth.paired", ["AirPods Pro"]);
  const safePaired = Array.isArray(paired) ? paired : [];
  const togglePair = (name) => setPaired((current) => { const list = Array.isArray(current) ? current : []; return list.includes(name) ? list.filter((item) => item !== name) : [...list, name]; });
  return <div className="pb-10" data-testid="bluetooth-page">
    <NavHeader title="Bluetooth" largeTitle="Bluetooth" onBack={() => navigate("/settings")} backLabel="Settings" />
    <OfflineBanner />
    <div className="space-y-6 pt-1">
      <IosGroup><IosRow icon={<div className="ios-icon w-[34px] h-[34px] rounded-[9px] bg-[#007AFF] flex items-center justify-center mr-3"><Bluetooth size={16} className="text-white" /></div>} label="Bluetooth" value={<Toggle on={on} onClick={setOn} testId="bluetooth-toggle" />} chevron={false} /></IosGroup>
      {on && <>
        <div><IosSectionHeader>My Devices</IosSectionHeader><IosGroup>{MY_DEVICES.map((name) => { const isPaired = safePaired.includes(name); return <IosRow key={name} label={name} value={<div className="flex items-center gap-2"><span className="text-[#8E8E93]">{isPaired ? "Connected (simulation)" : "Not Connected"}</span><button type="button" aria-label={`Details for ${name}`} onClick={(event) => { event.stopPropagation(); togglePair(name); }}><Info size={19} className="text-[#007AFF]" /></button></div>} onClick={() => togglePair(name)} chevron={false} testId={`bt-my-${name}`} />; })}</IosGroup></div>
        <div><IosSectionHeader><span className="inline-flex items-center gap-2">Other Devices <Loader2 size={12} className="animate-spin text-[#8E8E93]" /></span></IosSectionHeader><IosGroup>{OTHER_DEVICES.map((name) => { const isPaired = safePaired.includes(name); return <IosRow key={name} label={name} value={isPaired ? <Check size={18} className="text-[#34C759]" /> : undefined} onClick={() => togglePair(name)} chevron={false} testId={`bt-other-${name}`} />; })}</IosGroup><IosSectionFooter>Tap device untuk pair/unpair simulasi. Tidak ada Bluetooth host yang diakses.</IosSectionFooter></div>
      </>}
      {!on && <IosSectionFooter>Bluetooth dimatikan di simulator; pairing tersimpan untuk sesi berikutnya.</IosSectionFooter>}
    </div>
  </div>;
}
