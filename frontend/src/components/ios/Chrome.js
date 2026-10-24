import React from "react";
import { ChevronLeft, Signal, Wifi, BatteryFull } from "lucide-react";
import { useIosBack, useIosNavigationState } from "@/components/ios/Navigation";

export function StatusBar() {
  return <div className="h-[44px] flex items-center justify-between px-6 pt-1 select-none" aria-hidden="true">
    <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--ios-label)" }}>9:41</span>
    <div className="flex items-center gap-1.5" style={{ color: "var(--ios-label)" }}><Signal size={17} strokeWidth={2.4} /><Wifi size={17} strokeWidth={2.4} /><BatteryFull size={22} strokeWidth={1.8} /></div>
  </div>;
}
export function NavHeader({ title, largeTitle, onBack, backLabel = "Settings", right }) {
  const back = useIosBack();
  const { scrollTop } = useIosNavigationState();
  const isMain = largeTitle === "Settings" && !onBack;
  const isCollapsed = isMain && scrollTop > 44;
  const heading = title || largeTitle;
  return <>
    <header className={`ios-nav-header ${isMain ? `ios-nav-main ${isCollapsed ? "is-collapsed" : ""}` : ""}`} style={{ backgroundColor: isMain ? "var(--ios-page-bg)" : "var(--ios-header-bg)" }}>
      <div className="ios-nav-toolbar flex items-center px-4 relative gap-2">
        {onBack ? <button type="button" data-testid="ios-back-button" aria-label={`Back to ${backLabel}`} onClick={() => back(onBack)} className="ios-glass-back shrink-0" title={backLabel}><ChevronLeft size={23} strokeWidth={2.3} /></button> : <div className="w-9" />}
        {heading && (!isMain || isCollapsed) && <h1 data-testid="ios-compact-title" className="absolute left-1/2 max-w-[55%] -translate-x-1/2 truncate text-[17px] font-semibold leading-[22px]" style={{ color: "var(--ios-label)" }}>{heading}</h1>}
        <div className="relative z-10 ml-auto">{right}</div>
      </div>
    </header>
    {isMain && <div className="ios-large-title px-5"><h1 aria-hidden={isCollapsed} className="text-[34px] font-bold leading-[41px] tracking-tight" style={{ color: "var(--ios-label)" }}>{largeTitle}</h1></div>}
  </>;
}
