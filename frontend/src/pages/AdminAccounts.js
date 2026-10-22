import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { DEVICE_SECTIONS } from "@/lib/deviceFields";
import { Smartphone, LogOut, Save, Plus, Trash2, KeyRound, X } from "lucide-react";

export default function AdminAccounts() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [cred, setCred] = useState({ username: "", label: "", password: "" });
  const [deviceForm, setDeviceForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ username: "", password: "", label: "" });

  const load = async (preferId) => {
    const res = await api.get("/admin/accounts");
    setAccounts(res.data);
    const pick = res.data.find((a) => a.id === preferId) || res.data[0];
    if (pick) selectAccount(pick);
    else {
      setSelectedId(null);
      setDeviceForm({});
    }
  };

  const selectAccount = (a) => {
    setSelectedId(a.id);
    setCred({ username: a.username, label: a.label || "", password: "" });
    setDeviceForm(a.device || {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeviceChange = (k, v) => setDeviceForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { username: cred.username, label: cred.label, device: deviceForm };
      if (cred.password) payload.password = cred.password;
      const res = await api.put(`/admin/accounts/${selectedId}`, payload);
      setAccounts((as) => as.map((a) => (a.id === res.data.id ? res.data : a)));
      setCred((c) => ({ ...c, password: "" }));
      toast.success("Tersimpan", { description: `Akun ${res.data.username} diperbarui.` });
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.response?.data?.detail || e.message });
    } finally {
      setSaving(false);
    }
  };

  const createAccount = async () => {
    try {
      const res = await api.post("/admin/accounts", newAcc);
      setShowAdd(false);
      setNewAcc({ username: "", password: "", label: "" });
      await load(res.data.id);
      toast.success("Akun dibuat", { description: `${res.data.username} siap dipakai login.` });
    } catch (e) {
      toast.error("Gagal membuat akun", { description: e.response?.data?.detail || e.message });
    }
  };

  const remove = async () => {
    if (!window.confirm(`Hapus akun "${cred.username}"?`)) return;
    await api.delete(`/admin/accounts/${selectedId}`);
    await load();
    toast.success("Akun dihapus");
  };

  const doLogout = () => {
    logout();
    navigate("/");
  };

  const inputCls =
    "w-full bg-white/[0.06] border border-white/12 rounded-lg px-3 h-11 text-[14px] text-white outline-none focus:border-[#0A84FF] transition-colors";

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <header className="sticky top-0 z-20 bg-[#0B0B0F]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Smartphone size={17} className="text-black" />
            </div>
            <div>
              <div className="font-semibold text-[15px] leading-tight">Account Admin</div>
              <div className="text-[11px] text-white/40 leading-tight">{auth?.email}</div>
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
        <h1 className="text-3xl font-bold tracking-tight mb-1">iPhone Accounts</h1>
        <p className="text-white/45 text-[14px] mb-6">
          Buat akun (username + password) untuk tiap iPhone. Pengguna login sendiri lalu bisa mengatur device-nya.
        </p>

        {/* Account chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6" data-testid="account-list">
          {accounts.map((a) => (
            <button
              key={a.id}
              data-testid={`account-chip-${a.username}`}
              onClick={() => selectAccount(a)}
              className={`shrink-0 text-left rounded-2xl border px-4 py-3 min-w-[190px] transition-colors ${
                selectedId === a.id
                  ? "border-[#0A84FF] bg-[#0A84FF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="font-semibold text-[14px] truncate">@{a.username}</div>
              <div className="text-[12px] text-white/45 mt-0.5 truncate">{a.label}</div>
              <div className="text-[11px] text-white/35 font-mono mt-1">{a.device?.imei}</div>
            </button>
          ))}
          <button
            data-testid="add-account-button"
            onClick={() => setShowAdd(true)}
            className="shrink-0 rounded-2xl border border-dashed border-white/20 px-4 min-w-[130px] flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white hover:border-white/40 transition-colors"
          >
            <Plus size={22} />
            <span className="text-[12px]">Add account</span>
          </button>
        </div>

        {selectedId && (
          <>
            {/* Credentials */}
            <section className="mb-8">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-3">Login Credentials</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div>
                  <label className="block text-[12px] text-white/50 mb-1.5">Username</label>
                  <input data-testid="acc-username" value={cred.username} onChange={(e) => setCred({ ...cred, username: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 mb-1.5">Label</label>
                  <input data-testid="acc-label" value={cred.label} onChange={(e) => setCred({ ...cred, label: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 mb-1.5 flex items-center gap-1"><KeyRound size={12} /> New Password (opsional)</label>
                  <input data-testid="acc-password" type="text" placeholder="kosongkan jika tak diubah" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} className={inputCls} />
                </div>
              </div>
            </section>

            {/* Device fields */}
            <div className="space-y-8">
              {DEVICE_SECTIONS.map((sec) => (
                <section key={sec.title}>
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-3">{sec.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    {sec.fields.map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-[12px] text-white/50 mb-1.5">{label}</label>
                        <input data-testid={`field-${key}`} value={deviceForm[key] ?? ""} onChange={(e) => onDeviceChange(key, e.target.value)} className={inputCls} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <button
              data-testid="delete-account-button"
              onClick={remove}
              className="mt-8 flex items-center gap-2 h-10 px-4 rounded-xl bg-[#FF453A]/15 text-[#FF453A] text-[13px] font-semibold hover:bg-[#FF453A]/25 transition-colors"
            >
              <Trash2 size={15} /> Hapus Akun
            </button>
          </>
        )}
      </main>

      {selectedId && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0B0B0F]/90 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-[13px] text-white/45">Editing: <span className="text-white font-medium">@{cred.username}</span></span>
            <button
              data-testid="admin-save-button"
              onClick={save}
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 active:scale-[0.98] transition-all font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={18} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Add account modal */}
      {showAdd && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-4" data-testid="add-account-modal">
          <div className="w-full max-w-sm bg-[#141418] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[17px]">Akun Baru</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <label className="block text-[12px] text-white/50 mb-1.5">Username</label>
            <input data-testid="new-username" value={newAcc.username} onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })} className={`${inputCls} mb-3`} />
            <label className="block text-[12px] text-white/50 mb-1.5">Password</label>
            <input data-testid="new-password" type="text" value={newAcc.password} onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })} className={`${inputCls} mb-3`} />
            <label className="block text-[12px] text-white/50 mb-1.5">Label (nama device)</label>
            <input data-testid="new-label" value={newAcc.label} onChange={(e) => setNewAcc({ ...newAcc, label: e.target.value })} className={`${inputCls} mb-5`} />
            <button
              data-testid="create-account-submit"
              onClick={createAccount}
              className="w-full h-11 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 font-semibold transition-colors"
            >
              Buat Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
