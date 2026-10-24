import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosSectionHeader } from "@/components/ios/IosList";
import { useDevice } from "@/context/DeviceContext";
import { DEVICE_SECTIONS } from "@/lib/deviceFields";
import { toast } from "sonner";

export default function UserEditDevice() {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from === "/account" ? "/account" : "/settings";
  const { device, refreshDevice, saveDevice } = useDevice();
  const [form, setForm] = useState(device || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshDevice()
      .then((d) => d && setForm(d))
      .catch(() => {});
  }, [refreshDevice]);

  useEffect(() => {
    if (device) setForm((f) => ({ ...device, ...f }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.imei]);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveDevice(form);
      toast.success("Tersimpan", { description: "Data device berhasil diperbarui." });
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.response?.data?.detail || e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28" data-testid="edit-device-page">
      <NavHeader title="Device Info" onBack={() => navigate(backPath)} backLabel={backPath === "/account" ? "Apple Account" : "Settings"} />

      <div className="space-y-5 pt-1">
        {DEVICE_SECTIONS.map((sec) => (
          <div key={sec.title}>
            <IosSectionHeader>{sec.title}</IosSectionHeader>
            <IosGroup>
              {sec.fields.map(([key, label]) => (
                <div key={key} className="flex items-center min-h-[44px] px-4 py-2 bg-white gap-3">
                  <span className="text-[15px] text-black shrink-0 w-[42%]">{label}</span>
                  <input
                    data-testid={`edit-${key}`}
                    value={form[key] ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                    className="flex-1 text-right text-[15px] text-[#007AFF] bg-transparent outline-none min-w-0"
                  />
                </div>
              ))}
            </IosGroup>
          </div>
        ))}
      </div>

      <div className="fixed sm:absolute bottom-0 inset-x-0 max-w-[430px] mx-auto px-4 py-3 bg-[#F2F2F7]/90 backdrop-blur-xl border-t border-[#C6C6C8]">
        <button
          data-testid="edit-save-button"
          onClick={save}
          disabled={saving}
          className="w-full h-12 rounded-[14px] bg-[#007AFF] text-white font-semibold text-[17px] active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
