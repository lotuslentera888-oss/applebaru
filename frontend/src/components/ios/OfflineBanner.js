import React from "react";
import { WifiOff } from "lucide-react";
import { useDevice } from "@/context/DeviceContext";

export function formatSynced(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

// Consistent "you are offline, showing saved data" banner used across screens.
export default function OfflineBanner({ message = "menampilkan data tersimpan", showSynced = true }) {
  const ctx = useDevice() || {};
  const { isOffline, lastSynced } = ctx;
  if (!isOffline) return null;
  return (
    <div
      className="mx-4 mt-1 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-tight text-amber-800"
      data-testid="offline-banner"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        Tidak ada koneksi — {message}
        {showSynced && lastSynced ? ` · diperbarui ${formatSynced(lastSynced)}` : ""}
      </span>
    </div>
  );
}
