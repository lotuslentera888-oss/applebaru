import React from "react";
import { ChevronRight } from "lucide-react";

// Footnote label above a group (iOS uppercase gray)
export function IosSectionHeader({ children }) {
  return (
    <div className="px-8 pt-2 pb-1.5 text-[13px] leading-[18px] text-[#6D6D72] uppercase tracking-[0.4px]">
      {children}
    </div>
  );
}

// Footnote text below a group
export function IosSectionFooter({ children }) {
  return (
    <div className="px-8 pt-1.5 pb-1 text-[13px] leading-[18px] text-[#6D6D72]">
      {children}
    </div>
  );
}

export function IosGroup({ children, className = "" }) {
  const items = React.Children.toArray(children);
  return (
    <div className={`ios-group bg-white mx-4 overflow-hidden ${className}`}>
      {items.map((child, i) => (
        <div key={i} className="relative">
          {child}
          {i < items.length - 1 && (
            <div className={`absolute bottom-0 ${child.props?.icon ? "left-[62px]" : "left-4"} right-4 h-[0.5px] bg-[#C6C6C8]/70`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function IosIcon({ color = "#8E8E93", children }) {
  return (
    <div
      className="ios-icon w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white shrink-0 mr-3"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

// A single tappable row
export function IosRow({
  icon,
  label,
  value,
  onClick,
  chevron = true,
  valueClass = "",
  labelClass = "",
  testId,
}) {
  const clickable = !!onClick;
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick(event);
        }
      } : undefined}
      className={`ios-row flex items-center pl-4 pr-4 py-2 bg-white ${
        clickable ? "cursor-pointer active:bg-[#D1D1D6]/60" : ""
      } transition-colors`}
    >
      {icon}
      <div className={`text-[17px] leading-[22px] text-black ${labelClass}`}>{label}</div>
      <div className="flex items-center ml-auto pl-3 min-w-0">
        {value !== undefined && value !== null && value !== "" && (
          <span
            className={`text-[17px] leading-[22px] text-[#8E8E93] truncate max-w-[210px] ${valueClass}`}
          >
            {value}
          </span>
        )}
        {chevron && clickable && (
          <ChevronRight className="text-[#C6C6C8] ml-1.5 shrink-0" size={19} strokeWidth={2.4} />
        )}
      </div>
    </div>
  );
}

// Static info row (label left, value right, no chevron) — used in About
export function IosInfoRow({ label, value, mono = false, testId }) {
  return (
    <div
      data-testid={testId}
      className="flex items-center justify-between gap-3 min-h-[44px] px-4 py-2 bg-white"
    >
      <span className="text-[17px] leading-[22px] text-black shrink-0">{label}</span>
      <span
        className={`text-[17px] leading-[22px] text-[#8E8E93] text-right break-all ${
          mono ? "font-mono text-[15px]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
