import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDevice } from "@/context/DeviceContext";
import { Phone as PhoneIcon, LogOut } from "lucide-react";

export default function Launcher() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { device } = useDevice();

  const doLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col" data-testid="launcher">
      <div className="flex items-center justify-between px-5 pt-6">
        <div>
          <div className="text-white/50 text-[12px]">Signed in as</div>
          <div className="text-white font-semibold text-[15px]">{device?.device_name || auth?.label || auth?.username}</div>
        </div>
        <button
          data-testid="launcher-logout"
          onClick={doLogout}
          className="text-white/60 hover:text-white flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <LogOut size={15} /> Keluar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="flex items-end justify-center gap-12">
          {/* Settings app icon (authentic silver gear) */}
          <button
            data-testid="app-settings"
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-2.5 active:scale-90 transition-transform"
          >
            <div
              className="w-[86px] h-[86px] rounded-[20px] flex items-center justify-center shadow-xl"
              style={{ backgroundImage: "linear-gradient(160deg, #fbfbfd 0%, #d1d1d6 55%, #a9a9b0 100%)" }}
            >
              <img src="/icons/settings.png" alt="" className="w-full h-full rounded-[20px]" />
            </div>
            <span className="text-white text-[15px]">Settings</span>
          </button>

          {/* Phone app icon (authentic green handset) */}
          <button
            data-testid="app-phone"
            onClick={() => navigate("/phone")}
            className="flex flex-col items-center gap-2.5 active:scale-90 transition-transform"
          >
            <div
              className="w-[86px] h-[86px] rounded-[20px] flex items-center justify-center shadow-xl"
              style={{ backgroundImage: "linear-gradient(160deg, #61e577 0%, #2ec24b 55%, #16a637 100%)" }}
            >
              <PhoneIcon size={48} color="white" fill="white" />
            </div>
            <span className="text-white text-[15px]">Phone</span>
          </button>
        </div>
        <p className="text-white/35 text-[13px] px-8 text-center max-w-xs">
          Buka Settings untuk atur device-mu, atau Phone lalu ketik <span className="font-mono">*#06#</span> untuk lihat IMEI.
        </p>
      </div>
    </div>
  );
}
