import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePreference } from "@/lib/preferences";
import { syncNativeAppearance } from "@/lib/native";

const AppearanceContext = createContext({ appearance: "Light", mode: "light", setAppearance: () => {} });
const QUERY = "(prefers-color-scheme: dark)";

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = usePreference("settings.display.appearance", "Light");
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(QUERY).matches || false);
  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return undefined;
    const change = () => setSystemDark(media.matches);
    change();
    if (media.addEventListener) media.addEventListener("change", change);
    else media.addListener(change);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", change);
      else media.removeListener(change);
    };
  }, []);
  const choice = ["Light", "Dark", "Automatic"].includes(appearance) ? appearance : "Light";
  const mode = choice === "Dark" || (choice === "Automatic" && systemDark) ? "dark" : "light";
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    // Native calls are serialized and stale choices are discarded by native.js.
    syncNativeAppearance(choice, mode).catch((error) => {
      console.warn("Native appearance could not be synchronized", error?.message);
    });
  }, [choice, mode]);
  const value = useMemo(() => ({ appearance: choice, mode, setAppearance }), [choice, mode, setAppearance]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
