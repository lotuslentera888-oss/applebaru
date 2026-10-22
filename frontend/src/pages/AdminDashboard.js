import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Smartphone, LogOut, Save, Plus, Trash2, Power, Copy } from "lucide-react";

const SECTIONS = [
  {
    title: "Identity",
    fields: [
      ["device_name", "Device Name"],
      ["model_name", "Model Name"],
      ["model_number", "Model Number"],
      ["part_number", "Part Number"],
      ["color", "Color"],
      ["ios_version", "iOS Version"],
      ["build_version", "Build Version"],
    ],
  },
  {
    title: "Content",
    fields: [
      ["songs", "Songs"],
      ["videos", "Videos"],
      ["photos", "Photos"],
      ["applications", "Applications"],
    ],
  },
  {
    title: "Storage",
    fields: [
      ["capacity", "Capacity"],
      ["available", "Available"],
    ],
  },
  {
    title: "Coverage",
    fields: [
      ["coverage_type", "Coverage Type"],
      ["warranty_status", "Warranty Status"],
    ],
  },
  {
    title: "Network",
    fields: [
      ["carrier", "Carrier"],
      ["carrier_version", "Network Provider Version"],
      ["carrier_lock", "Carrier Lock"],
    ],
  },
  {
    title: "Identifiers",
    fields: [
      ["serial_number", "Serial Number"],
      ["imei", "IMEI"],
      ["imei2", "IMEI2"],
      ["meid", "MEID"],
      ["iccid", "ICCID"],
      ["eid", "EID"],
      ["seeid", "SEID"],
    ],
  },
  {
    title: "Radios",
    fields: [
      ["modem_firmware", "Modem Firmware"],
      ["wifi_address", "Wi-Fi Address"],
      ["bluetooth", "Bluetooth Address"],
    ],
  },
  {
    title: "System & Status",
    fields: [
      ["certificate_trust_store", "Certificate Trust Store"],
      ["region", "Region"],
      ["purchase_date", "Purchase Date"],
      ["activation_status", "Activation Status"],
      ["find_my_iphone", "Find My iPhone"],
      ["icloud_lock", "iCloud Lock"],
      ["blacklist_status", "Blacklist Status"],
      ["battery_max_capacity", "Battery Max Capacity"],
      ["battery_charge_cycles", "Charge Cycles"],
    ],
  },
];

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (preferId) => {
    const res = await api.get("/devices");
    setDevices(res.data);
    const pick =
      res.data.find((x) => x.id === preferId) ||
      res.data.find((x) => x.is_active) ||
      res.data[0];
    if (pick) {
      setSelectedId(pick.id);
      setForm(pick);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectDevice = (dev) => {
    setSelectedId(dev.id);
    setForm(dev);
  };

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { id, is_active, ...payload } = form;
      const res = await api.put(`/devices/${selectedId}`, payload);
      setDevices((ds) => ds.map((d) => (d.id === res.data.id ? res.data : d)));
      setForm(res.data);
      toast.success("Tersimpan", { description: `${res.data.device_name} berhasil diperbarui.` });
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.response?.data?.detail || e.message });
    } finally {
      setSaving(false);
    }
  };

  const addDevice = async () => {
    const res = await api.post("/devices", { device_name: "New iPhone" });
    await load(res.data.id);
    toast.success("Perangkat ditambahkan");
  };

  const duplicate = async () => {
    const { id, is_active, ...payload } = form;
    payload.device_name = `${form.device_name} Copy`;
    const res = await api.post("/devices", payload);
    await load(res.data.id);
    toast.success("Profil diduplikasi", { description: "Ubah IMEI untuk membuat varian baru." });
  };

  const activate = async () => {
    await api.post(`/devices/${selectedId}/activate`);
    await load(selectedId);
    toast.success("Perangkat aktif diubah", { description: "Simulasi kini memakai perangkat ini." });
  };

  const remove = async () => {
    if (devices.length <= 1) {
      toast.error("Minimal satu perangkat harus ada");
      return;
    }
    if (!window.confirm(`Hapus perangkat "${form.device_name}"?`)) return;
    await api.delete(`/devices/${selectedId}`);
    await load();
    toast.success("Perangkat dihapus");
  };

  const doLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <header className="sticky top-0 z-20 bg-[#0B0B0F]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Smartphone size={17} className="text-black" />
            </div>
            <div>
              <div className="font-semibold text-[15px] leading-tight">Device Admin</div>
              <div className="text-[11px] text-white/40 leading-tight">{admin?.email}</div>
            </div>
          </div>
          <button
            data-testid="admin-logout"
            onClick={doLogout}
            className="text-[13px] text-white/60 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Device Profiles</h1>
        <p className="text-white/45 text-[14px] mb-6">
          Kelola beberapa perangkat. Perangkat <span className="text-[#34C759] font-medium">Active</span> yang
          ditampilkan di Settings, About &amp; dialer <span className="font-mono">*#06#</span>.
        </p>

        {/* Profile chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6" data-testid="device-list">
          {devices.map((dev) => (
            <button
              key={dev.id}
              data-testid={`device-chip-${dev.id}`}
              onClick={() => selectDevice(dev)}
              className={`shrink-0 text-left rounded-2xl border px-4 py-3 min-w-[210px] transition-colors ${
                selectedId === dev.id
                  ? "border-[#0A84FF] bg-[#0A84FF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px] truncate">{dev.device_name}</span>
                {dev.is_active && (
                  <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/15 px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[12px] text-white/45 mt-0.5">{dev.model_name}</div>
              <div className="text-[11px] text-white/35 font-mono mt-1">{dev.imei}</div>
            </button>
          ))}
          <button
            data-testid="add-device-button"
            onClick={addDevice}
            className="shrink-0 rounded-2xl border border-dashed border-white/20 px-4 min-w-[130px] flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white hover:border-white/40 transition-colors"
          >
            <Plus size={22} />
            <span className="text-[12px]">Add device</span>
          </button>
        </div>

        {form && (
          <>
            <div className="flex items-center gap-3 mb-7">
              <button
                data-testid="activate-device-button"
                onClick={activate}
                disabled={form.is_active}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#34C759] text-white text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                <Power size={15} /> {form.is_active ? "Active" : "Set Active"}
              </button>
              <button
                data-testid="duplicate-device-button"
                onClick={duplicate}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/10 text-white text-[13px] font-semibold hover:bg-white/20 transition-colors"
              >
                <Copy size={15} /> Duplicate
              </button>
              <button
                data-testid="delete-device-button"
                onClick={remove}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#FF453A]/15 text-[#FF453A] text-[13px] font-semibold hover:bg-[#FF453A]/25 transition-colors"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>

            <div className="space-y-8">
              {SECTIONS.map((sec) => (
                <section key={sec.title}>
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-3">
                    {sec.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    {sec.fields.map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-[12px] text-white/50 mb-1.5">{label}</label>
                        <input
                          data-testid={`field-${key}`}
                          value={form[key] ?? ""}
                          onChange={(e) => onChange(key, e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/12 rounded-lg px-3 h-11 text-[14px] text-white outline-none focus:border-[#0A84FF] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>

      {form && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0B0B0F]/90 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-[13px] text-white/45">
              Editing: <span className="text-white font-medium">{form.device_name}</span>
            </span>
            <button
              data-testid="admin-save-button"
              onClick={save}
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 active:scale-[0.98] transition-all font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
