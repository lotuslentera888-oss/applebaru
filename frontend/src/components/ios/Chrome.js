import React from "react";
import { ChevronLeft, Signal, Wifi, BatteryFull } from "lucide-react";
import { useIosBack } from "@/components/ios/Navigation";

export function StatusBar() {
  return (
    <div className="h-[44px] flex items-center justify-between px-6 pt-1 select-none" aria-hidden="true">
      <span className="text-[15px] font-semibold text-black tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5 text-black">
        <Signal size={17} strokeWidth={2.4} /><Wifi size={17} strokeWidth={2.4} />
        <BatteryFull size={22} strokeWidth={1.8} />
      </div>
    </div>
  );
}

export function NavHeader({ title, largeTitle, onBack, backLabel = "Settings", right }) {
  const back = useIosBack();
  // Detail pages use the compact centered title shown in the client's reference.
  const useLargeTitle = largeTitle === "Settings" && !onBack;
  const heading = title || largeTitle;
  return (
    <header className={`ios-nav-header sticky top-0 z-40 ${useLargeTitle ? "ios-nav-header-large" : ""}`}>
      <div className="ios-nav-toolbar flex items-center px-4 relative gap-2">
        {onBack ? (
          <button type="button" data-testid="ios-back-button" aria-label={`Back to ${backLabel}`}
            onClick={() => back(onBack)} className="ios-glass-back shrink-0" title={backLabel}>
            <ChevronLeft size={23} strokeWidth={2.3} />
          </button>
        ) : <div className="w-9" />}
        {heading && !useLargeTitle && (
          <h1 data-testid="ios-compact-title" className="absolute left-1/2 -translate-x-1/2 text-[17px] leading-[22px] font-semibold text-black max-w-[55%] truncate">{heading}</h1>
        )}
        <div className="ml-auto relative z-10">{right}</div>
      </div>
      {useLargeTitle && (
        <div className="px-5 pb-2 pt-0">
          <h1 className="text-[34px] leading-[41px] font-bold tracking-tight text-black">{largeTitle}</h1>
        </div>
      )}
    </header>
  );
}
