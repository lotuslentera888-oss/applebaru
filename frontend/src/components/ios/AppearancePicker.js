import React from "react";
import { Check } from "lucide-react";
import { useAppearance } from "@/context/AppearanceContext";

export default function AppearancePicker({ value, onChange }) {
  const { mode } = useAppearance();
  const selected = value === "Automatic" ? (mode === "dark" ? "Dark" : "Light") : value;
  return <div data-testid="pref-settings.display.appearance" className="px-4 py-3">
    <div className="mb-2 text-[13px] uppercase" style={{ color: "var(--ios-footer)" }}>Appearance</div>
    <div className="flex gap-3" role="radiogroup" aria-label="Appearance">
      {["Light", "Dark"].map((choice) => <button key={choice} type="button" role="radio" aria-checked={selected === choice} aria-label={`${choice} appearance`} data-testid={`appearance-${choice.toLowerCase()}`} className="appearance-choice flex-1" onClick={() => onChange(choice)}>
        <div className="appearance-preview" aria-hidden="true" style={{ background: choice === "Dark" ? "#000" : "#f2f2f7" }}>
          {[0, 1, 2, 3].map((row) => <span key={row} style={{ background: choice === "Dark" ? "#3a3a3c" : "#fff" }} />)}
        </div>
        <div className="text-[17px]">{choice}</div>
        <div className="mt-2 flex justify-center" style={{ color: "var(--ios-link)" }}><span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: selected === choice ? "var(--ios-link)" : "var(--ios-divider)", background: selected === choice ? "var(--ios-link)" : "transparent" }}>{selected === choice && <Check size={14} color="white" strokeWidth={3} />}</span></div>
      </button>)}
    </div>
    <div className="mt-3 flex items-center justify-between gap-4 text-[17px]" style={{ color: "var(--ios-label)" }}>
      <span>Automatic</span>
      <button type="button" role="switch" aria-label="Automatic appearance" aria-checked={value === "Automatic"} data-testid="appearance-automatic" className="ios-toggle relative h-[31px] w-[51px] shrink-0 rounded-full" onClick={() => onChange(value === "Automatic" ? (mode === "dark" ? "Dark" : "Light") : "Automatic")}>
        <span className={`ios-toggle-knob absolute top-[2px] h-[27px] w-[27px] rounded-full shadow ${value === "Automatic" ? "left-[22px]" : "left-[2px]"}`} />
      </button>
    </div>
  </div>;
}
