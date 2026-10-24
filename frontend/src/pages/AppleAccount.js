import React from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosIcon, IosRow, IosSectionFooter } from "@/components/ios/IosList";
import { useAuth } from "@/context/AuthContext";
import { useDevice } from "@/context/DeviceContext";
import { usePreference } from "@/lib/preferences";
import {
  Cloud,
  CreditCard,
  Gamepad2,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
  UsersRound,
} from "lucide-react";

const ACCOUNT_ROWS = [
  { key: "personal", label: "Personal Information", icon: UserRound, color: "#007AFF" },
  { key: "security", label: "Sign-In & Security", icon: ShieldCheck, color: "#5856D6" },
  { key: "payment", label: "Payment & Shipping", icon: CreditCard, color: "#34C759" },
  { key: "subscriptions", label: "Subscriptions", icon: Package, color: "#AF52DE" },
  { key: "icloud", label: "iCloud", icon: Cloud, color: "#007AFF" },
  { key: "media", label: "Media & Purchases", icon: Gamepad2, color: "#FF2D55" },
  { key: "find-my", label: "Find My", icon: MapPin, color: "#FF9500" },
  { key: "family", label: "Family", icon: UsersRound, color: "#FF2D55" },
];

function initialsFor(value) {
  const initials = String(value || "Apple Account")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return initials || "A";
}

function AccountRow({ row, onClick }) {
  const Icon = row.icon;
  return (
    <IosRow
      icon={
        <IosIcon color={row.color}>
          <Icon size={17} strokeWidth={2.2} />
        </IosIcon>
      }
      label={row.label}
      onClick={onClick}
      testId={`account-row-${row.key}`}
    />
  );
}

export default function AppleAccount() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { device } = useDevice();
  const [displayName] = usePreference("account.displayName", auth?.username || "Apple Account");
  const [email] = usePreference("account.email", auth?.email || "");
  const safeDisplayName = displayName || auth?.username || "Apple Account";
  const initials = initialsFor(safeDisplayName);
  const accountSubtitle = email || "Local account profile";

  return (
    <div className="pb-10" data-testid="apple-account-page">
      <NavHeader title="Apple Account" onBack={() => navigate("/settings")} backLabel="Settings" />

      <div className="px-4 pb-5 pt-1">
        <button
          type="button"
          data-testid="apple-account-profile-card"
          onClick={() => navigate("/account/personal")}
          className="flex w-full items-center gap-3.5 rounded-[22px] bg-white px-4 py-3.5 text-left transition-colors active:bg-[#D1D1D6]/60"
        >
          <div
            aria-hidden="true"
            className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#C7C7CC] to-[#8E8E93] text-[21px] font-semibold tracking-tight text-white"
          >
            {initials}
          </div>
          <span className="min-w-0">
            <span className="block truncate text-[19px] font-semibold leading-6 text-black">{safeDisplayName}</span>
            <span className="mt-0.5 block truncate text-[14px] leading-5 text-[#8E8E93]">{accountSubtitle}</span>
          </span>
          <span className="ml-auto shrink-0 text-[14px] font-medium text-[#007AFF]">View</span>
        </button>
      </div>

      <div className="space-y-6">
        <IosGroup>
          {ACCOUNT_ROWS.map((row) => (
            <AccountRow key={row.key} row={row} onClick={() => navigate(`/account/${row.key}`)} />
          ))}
        </IosGroup>

        <div>
          <IosGroup>
            <IosRow
              icon={
                <IosIcon color="#8E8E93">
                  <Smartphone size={17} strokeWidth={2.1} />
                </IosIcon>
              }
              label={device?.device_name || "This iPhone"}
              value="Device Info"
              onClick={() => navigate("/edit", { state: { from: "/account" } })}
              testId="account-device-row"
            />
            <IosRow
              icon={
                <IosIcon color="#636366">
                  <Search size={17} strokeWidth={2.1} />
                </IosIcon>
              }
              label="About"
              value="Device details"
              onClick={() => navigate("/about", { state: { from: "/account" } })}
              testId="account-about-row"
            />
          </IosGroup>
          <IosSectionFooter>
            Device information remains available separately. Account controls on this screen are a local simulator experience.
          </IosSectionFooter>
        </div>
      </div>
    </div>
  );
}
