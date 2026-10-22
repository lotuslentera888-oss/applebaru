import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [device, setDevice] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_device")) || null;
    } catch {
      return null;
    }
  });

  // When the last device data was successfully fetched from the server.
  const [lastSynced, setLastSynced] = useState(() => {
    const t = localStorage.getItem("cached_device_at");
    return t ? Number(t) : null;
  });

  // True when we are showing cached data because the server is unreachable.
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine === false
  );

  const persist = (data) => {
    localStorage.setItem("cached_device", JSON.stringify(data));
    const now = Date.now();
    localStorage.setItem("cached_device_at", String(now));
    setLastSynced(now);
  };

  const refreshDevice = useCallback(async () => {
    if (!localStorage.getItem("auth_token")) return null;
    try {
      const res = await api.get("/me/device");
      setDevice(res.data);
      persist(res.data);
      setIsOffline(false);
      return res.data;
    } catch (err) {
      // No response => network/offline. Keep whatever is cached and flag offline
      // so the UI can show a subtle "showing saved data" banner.
      if (!err?.response) setIsOffline(true);
      throw err;
    }
  }, []);

  const saveDevice = useCallback(async (payload) => {
    const res = await api.put("/me/device", payload);
    setDevice(res.data);
    persist(res.data);
    setIsOffline(false);
    return res.data;
  }, []);

  useEffect(() => {
    refreshDevice().catch(() => {});

    // React to connectivity changes: re-sync when back online, flag offline when lost.
    const onOnline = () => refreshDevice().catch(() => {});
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshDevice]);

  return (
    <DeviceContext.Provider value={{ device, refreshDevice, saveDevice, isOffline, lastSynced }}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
