import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosRow, IosSectionHeader, IosSectionFooter } from "@/components/ios/IosList";
import OfflineBanner from "@/components/ios/OfflineBanner";
import { usePreference } from "@/lib/preferences";
import { Wifi, Lock, Check, Info, Plus, X } from "lucide-react";

function Toggle({ on, onClick, testId }) { return <button type="button" role="switch" aria-checked={on} data-testid={testId} onClick={() => onClick(!on)} className={`w-[51px] h-[31px] rounded-full relative transition-colors ${on ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}><span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-all ${on ? "left-[22px]" : "left-[2px]"}`} /></button>; }

const OTHER_NETWORKS = ["IndiHome-2.4G", "Andi_Guest", "RT03-WiFi", "OPPO A57", "TP-Link_5G", "Kopi Kenangan"];

export default function WifiPage() {
  const navigate = useNavigate();
  const [on, setOn] = usePreference("connectivity.wifi.enabled", true);
  const [connected, setConnected] = usePreference("connectivity.wifi.connected", "");
  const [detailNetwork, setDetailNetwork] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [manualName, setManualName] = useState("");
  const join = (network) => { setConnected(network); setShowOther(false); setManualName(""); };
  const wifiIcon = <Wifi size={17} strokeWidth={2.2} className="text-[#8E8E93]" />;
  return <div className="pb-10" data-testid="wifi-page">
    <NavHeader title="Wi-Fi" largeTitle="Wi-Fi" onBack={() => navigate("/settings")} backLabel="Settings" />
    <OfflineBanner />
    <div className="space-y-6 pt-1">
      <IosGroup><IosRow icon={<div className="ios-icon w-[34px] h-[34px] rounded-[9px] bg-[#007AFF] flex items-center justify-center mr-3"><Wifi size={17} className="text-white" /></div>} label="Wi-Fi" value={<Toggle on={on} onClick={setOn} testId="wifi-toggle" />} chevron={false} /></IosGroup>
      {on && <>
        {connected && <div><IosSectionHeader>My Network</IosSectionHeader><IosGroup><IosRow icon={<Check size={20} className="text-[#007AFF] mr-2.5 shrink-0" />} label={connected} value={<div className="flex items-center gap-2"><Lock size={15} className="text-black" />{wifiIcon}<button type="button" aria-label={`Details for ${connected}`} onClick={(event) => { event.stopPropagation(); setDetailNetwork(connected); }}><Info size={19} className="text-[#007AFF]" /></button></div>} onClick={() => setDetailNetwork(connected)} testId="wifi-connected" /></IosGroup></div>}
        <div><IosSectionHeader>Other Networks</IosSectionHeader><IosGroup>{OTHER_NETWORKS.map((network) => <IosRow key={network} icon={<div className="w-[20px] mr-2.5" />} label={network} value={<div className="flex items-center gap-2"><Lock size={15} className="text-black" />{wifiIcon}<button type="button" aria-label={`Details for ${network}`} onClick={(event) => { event.stopPropagation(); setDetailNetwork(network); }}><Info size={19} className="text-[#007AFF]" /></button></div>} onClick={() => join(network)} testId={`wifi-net-${network}`} />)}<IosRow icon={<div className="w-[20px] mr-2.5" />} label="Other..." value={<Plus size={19} className="text-[#007AFF]" />} onClick={() => setShowOther(true)} testId="wifi-other" /></IosGroup><IosSectionFooter>Jaringan di atas adalah contoh simulasi. Tap untuk join lokal; tidak ada koneksi host yang diubah.</IosSectionFooter></div>
      </>}
    </div>
    {showOther && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-8"><div className="w-full max-w-[340px] rounded-[18px] bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-[18px] font-semibold">Join Other Network</h2><button type="button" aria-label="Close" onClick={() => setShowOther(false)}><X size={20} /></button></div><input autoFocus value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="Network Name" className="mt-4 w-full rounded-[10px] bg-[#F2F2F7] px-3 py-2.5 outline-none" /><button type="button" disabled={!manualName.trim()} onClick={() => join(manualName.trim())} className="mt-4 w-full rounded-[12px] bg-[#007AFF] py-2.5 font-semibold text-white disabled:opacity-40">Join (simulation)</button></div></div>}
    {detailNetwork && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-8"><div className="w-full max-w-[340px] rounded-[18px] bg-white p-5 shadow-2xl"><h2 className="text-[18px] font-semibold">{detailNetwork}</h2><p className="mt-3 text-[15px] leading-5 text-[#6D6D72]">Network detail is simulated. Passwords are never requested or sent.</p><button type="button" onClick={() => { join(detailNetwork); setDetailNetwork(""); }} className="mt-5 w-full rounded-[12px] bg-[#007AFF] py-2.5 font-semibold text-white">Join simulation</button><button type="button" onClick={() => setDetailNetwork("")} className="mt-2 w-full py-2 text-[#007AFF]">Cancel</button></div></div>}
  </div>;
}
