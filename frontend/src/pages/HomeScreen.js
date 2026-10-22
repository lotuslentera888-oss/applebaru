import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Phone, MessageCircle, Compass, Camera, Image, Clock, Map,
  ShoppingBag, Music2, CloudSun, StickyNote, Mail, Video,
} from "lucide-react";

function AppIcon({ label, color, gradient, icon, onClick, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div
        className="w-[62px] h-[62px] rounded-[15px] flex items-center justify-center text-white shadow-lg"
        style={gradient ? { backgroundImage: gradient } : { backgroundColor: color }}
      >
        {icon}
      </div>
      <span className="text-[11px] text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {label}
      </span>
    </button>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const sim = (name) => () => toast(name, { description: "App ini hanya simulasi." });

  const iconProps = { size: 30, strokeWidth: 1.9 };

  const apps = [
    { label: "FaceTime", color: "#34C759", icon: <Video {...iconProps} />, onClick: sim("FaceTime"), testId: "app-facetime" },
    { label: "Calendar", color: "#FFFFFF", icon: <Clock {...iconProps} color="#FF3B30" />, onClick: sim("Calendar"), testId: "app-calendar" },
    { label: "Photos", gradient: "conic-gradient(from 180deg, #F9D423, #FF4E50, #6A5AF9, #22D3EE, #F9D423)", icon: <Image {...iconProps} />, onClick: sim("Photos"), testId: "app-photos" },
    { label: "Camera", color: "#3A3A3C", icon: <Camera {...iconProps} />, onClick: sim("Camera"), testId: "app-camera" },
    { label: "Maps", color: "#5AC85A", icon: <Map {...iconProps} />, onClick: sim("Maps"), testId: "app-maps" },
    { label: "Clock", color: "#1C1C1E", icon: <Clock {...iconProps} />, onClick: sim("Clock"), testId: "app-clock" },
    { label: "Weather", gradient: "linear-gradient(160deg, #2F80ED, #56CCF2)", icon: <CloudSun {...iconProps} />, onClick: sim("Weather"), testId: "app-weather" },
    { label: "Notes", gradient: "linear-gradient(160deg, #FEE9A6, #FBC531)", icon: <StickyNote {...iconProps} color="#8a6d00" />, onClick: sim("Notes"), testId: "app-notes" },
    { label: "App Store", gradient: "linear-gradient(160deg, #2AA9FF, #0A6CFF)", icon: <ShoppingBag {...iconProps} />, onClick: sim("App Store"), testId: "app-appstore" },
    { label: "Music", gradient: "linear-gradient(160deg, #FB5C74, #F53844)", icon: <Music2 {...iconProps} />, onClick: sim("Music"), testId: "app-music" },
    { label: "Mail", gradient: "linear-gradient(160deg, #4EA9FF, #1E6FFF)", icon: <Mail {...iconProps} />, onClick: sim("Mail"), testId: "app-mail" },
    { label: "Settings", color: "#8E8E93", icon: <img src="/icons/settings.png" alt="" className="w-full h-full rounded-[15px]" />, onClick: () => navigate("/settings"), testId: "app-settings" },
  ];

  const dock = [
    { label: "Phone", color: "#34C759", icon: <Phone {...iconProps} fill="white" />, onClick: () => navigate("/phone"), testId: "dock-phone" },
    { label: "Safari", gradient: "linear-gradient(160deg, #EAF2FF, #1E9BFF)", icon: <Compass {...iconProps} color="#1E7BFF" />, onClick: sim("Safari"), testId: "dock-safari" },
    { label: "Messages", gradient: "linear-gradient(160deg, #5BF675, #23C24B)", icon: <MessageCircle {...iconProps} />, onClick: sim("Messages"), testId: "dock-messages" },
    { label: "Settings", color: "#8E8E93", icon: <img src="/icons/settings.png" alt="" className="w-full h-full rounded-[15px]" />, onClick: () => navigate("/settings"), testId: "dock-settings" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col relative"
      data-testid="home-screen"
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 20% 10%, #6D5BF5 0%, transparent 55%), radial-gradient(120% 90% at 85% 20%, #FF6FB5 0%, transparent 50%), radial-gradient(140% 120% at 50% 100%, #12C2E9 0%, #3A1C71 70%)",
      }}
    >
      {/* App grid */}
      <div className="flex-1 px-6 pt-16">
        <div className="grid grid-cols-4 gap-x-5 gap-y-7">
          {apps.map((a) => (
            <AppIcon key={a.label} {...a} />
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="px-4 pb-8">
        <div className="rounded-[30px] bg-white/20 backdrop-blur-xl border border-white/25 px-4 py-3">
          <div className="grid grid-cols-4 gap-5 justify-items-center">
            {dock.map((a) => (
              <button
                key={a.label}
                data-testid={a.testId}
                onClick={a.onClick}
                className="active:scale-90 transition-transform"
              >
                <div
                  className="w-[60px] h-[60px] rounded-[15px] flex items-center justify-center text-white shadow-lg"
                  style={a.gradient ? { backgroundImage: a.gradient } : { backgroundColor: a.color }}
                >
                  {a.icon}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
