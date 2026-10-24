import React from "react";
import { ChevronRight } from "lucide-react";

export function IosSectionHeader({ children }) {
  return <div className="px-8 pt-2 pb-1.5 text-[13px] leading-[18px] text-[#6D6D72] uppercase tracking-[0.3px]">{children}</div>;
}
export function IosSectionFooter({ children }) {
  return <div className="px-8 pt-1.5 pb-1 text-[13px] leading-[18px] text-[#6D6D72]">{children}</div>;
}
export function IosGroup({ children, className = "" }) {
  const items = React.Children.toArray(children);
  return <div className={`ios-group bg-white mx-4 overflow-hidden ${className}`}>
    {items.map((child, i) => <div key={child.key || i} className="relative">
      {child}
      {i < items.length - 1 && <div className={`absolute bottom-0 ${child.props?.icon ? "left-[62px]" : "left-4"} right-4 h-[0.5px] bg-[#C6C6C8]/65`} />}
    </div>)}
  </div>;
}
export function IosIcon({ color = "#8E8E93", children }) {
  return <div className="ios-icon w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white shrink-0 mr-3" style={{ backgroundColor: color }} aria-hidden="true">{children}</div>;
}
export function IosRow({ icon, label, value, onClick, chevron = true, valueClass = "", labelClass = "", testId }) {
  const clickable = !!onClick;
  const hasValue = value !== undefined && value !== null && value !== "";
  return <div data-testid={testId} onClick={onClick} role={clickable ? "button" : undefined}
    tabIndex={clickable ? 0 : undefined}
    onKeyDown={clickable ? (event) => {
      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault(); onClick(event);
      }
    } : undefined}
    className={`ios-row flex items-center px-4 py-2 bg-white ${clickable ? "cursor-pointer active:bg-[#D1D1D6]/60" : ""} transition-colors`}>
    {icon}
    <div className={`ios-row-label text-[17px] leading-[22px] text-black ${labelClass}`}>{label}</div>
    <div className="flex items-center ml-auto pl-3 min-w-0 max-w-[60%] shrink-0">
      {hasValue && <span className={`text-[17px] leading-[22px] text-[#8E8E93] truncate max-w-full ${valueClass}`}>{value}</span>}
      {chevron && clickable && <ChevronRight className="text-[#C6C6C8] ml-1.5 shrink-0" size={17} strokeWidth={2.2} />}
    </div>
  </div>;
}
export function IosInfoRow({ label, value, mono = false, testId }) {
  const display = value === undefined || value === null || value === "" ? "—" : value;
  // Keep a calendar date as one visual unit; a lonely year looked unlike iOS.
  const months = "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
  const readable = typeof display === "string" ? display
    .replace(new RegExp(`\\b(\\d{1,2})\\s+(${months})\\s+(\\d{4})\\b`, "gi"), (_, day, month, year) => `${day}\u00a0${month}\u00a0${year}`)
    .replace(new RegExp(`\\b(${months})\\s+(\\d{1,2},?)\\s+(\\d{4})\\b`, "gi"), (_, month, day, year) => `${month}\u00a0${day}\u00a0${year}`)
    : display;
  return <div data-testid={testId} className="ios-info-row bg-white">
    <span className="ios-info-label text-black">{label}</span>
    <span className={`ios-info-value ${mono ? "ios-info-value--mono" : ""}`} title={typeof display === "string" ? display : undefined}>{readable}</span>
  </div>;
}
