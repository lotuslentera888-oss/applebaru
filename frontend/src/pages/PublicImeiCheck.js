import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Smartphone, Search, CheckCircle2, XCircle, ShieldCheck, Loader2 } from "lucide-react";

const Field = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/10 last:border-0">
    <span className="text-[13px] uppercase tracking-wide text-white/45">{label}</span>
    <span className="text-[14px] text-white text-right font-medium break-all">{value || "—"}</span>
  </div>
);

const StatusPill = ({ label, value, ok }) => (
  <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
    <span className="text-[13px] text-white/50">{label}</span>
    <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${ok ? "text-[#34C759]" : "text-[#FF453A]"}`}>
      {ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      {value}
    </span>
  </div>
);

export default function PublicImeiCheck() {
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | {found, ...}

  const check = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get("/imei/check", { params: { imei: imei.trim() } });
      setResult(res.data);
    } catch {
      setResult({ found: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  const r = result?.result;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-20 w-[420px] h-[420px] rounded-full bg-[#007AFF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-24 w-[380px] h-[380px] rounded-full bg-[#5E5CE6]/15 blur-[120px]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Smartphone size={18} className="text-black" />
          </div>
          <span className="font-semibold tracking-tight">IMEI Check</span>
        </div>
        <Link to="/settings" data-testid="nav-settings-link" className="text-[13px] text-white/50 hover:text-white transition-colors">
          Open Settings →
        </Link>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-8 pb-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.3px] text-[#0A84FF] mb-3">Device Verification</p>
        <h1 className="text-[40px] leading-[1.05] font-bold tracking-tight mb-4">
          Check any device<br />by its IMEI number.
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mb-8 max-w-md">
          Enter a 15-digit IMEI to instantly verify the model, warranty, carrier lock and activation status.
        </p>

        <form onSubmit={check} className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="flex items-center gap-2.5 flex-1 bg-white/[0.06] border border-white/12 rounded-2xl px-4 h-14 focus-within:border-[#0A84FF] transition-colors">
            <Search size={19} className="text-white/40 shrink-0" />
            <input
              data-testid="imei-input"
              value={imei}
              onChange={(e) => setImei(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 356789104532198"
              inputMode="numeric"
              maxLength={17}
              className="bg-transparent outline-none flex-1 text-[16px] tracking-wider placeholder:text-white/30"
            />
          </div>
          <button
            data-testid="imei-check-button"
            type="submit"
            disabled={loading}
            className="h-14 px-7 rounded-2xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 active:scale-[0.98] transition-all font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Verify
          </button>
        </form>

        {result && result.found && r && (
          <div data-testid="imei-result-found" className="rounded-3xl bg-white/[0.04] border border-white/10 p-6 backdrop-blur-xl animate-[fadeIn_0.3s_ease]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#34C759]/15 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-[#34C759]" />
              </div>
              <div>
                <div className="text-[19px] font-bold leading-tight">{r.model_name}</div>
                <div className="text-[13px] text-white/45">{r.color} · {r.capacity}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <StatusPill label="Warranty" value={r.warranty_status?.split("—")[0]?.trim() || r.warranty_status} ok={/active/i.test(r.warranty_status || "")} />
              <StatusPill label="Activation" value={r.activation_status} ok={/activ/i.test(r.activation_status || "")} />
              <StatusPill label="iCloud / FMi" value={r.icloud_lock} ok={/clean|off/i.test(r.icloud_lock || "")} />
              <StatusPill label="Blacklist" value={r.blacklist_status} ok={/clean/i.test(r.blacklist_status || "")} />
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/10 px-5 py-1">
              <Field label="Model Number" value={r.model_number} />
              <Field label="Serial Number" value={r.serial_number} />
              <Field label="IMEI" value={r.imei} />
              <Field label="IMEI2" value={r.imei2} />
              <Field label="MEID" value={r.meid} />
              <Field label="iOS Version" value={`iOS ${r.ios_version}`} />
              <Field label="Carrier" value={r.carrier} />
              <Field label="Carrier Lock" value={r.carrier_lock} />
              <Field label="Region" value={r.region} />
              <Field label="Battery" value={r.battery_max_capacity} />
            </div>
          </div>
        )}

        {result && !result.found && (
          <div data-testid="imei-result-notfound" className="rounded-3xl bg-[#FF453A]/[0.06] border border-[#FF453A]/25 p-8 text-center animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 rounded-2xl bg-[#FF453A]/15 flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-[#FF453A]" />
            </div>
            <div className="text-[18px] font-bold mb-1">No device found</div>
            <p className="text-white/50 text-[14px]">
              IMEI <span className="font-mono text-white/70">{result.imei}</span> tidak cocok dengan data yang tersimpan di server.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
