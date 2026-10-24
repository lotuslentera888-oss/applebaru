import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosIcon, IosInfoRow, IosRow, IosSectionFooter } from "@/components/ios/IosList";
import { useAuth } from "@/context/AuthContext";
import { usePreference } from "@/lib/preferences";
import {
  Bell,
  Check,
  Cloud,
  CreditCard,
  Download,
  Heart,
  KeyRound,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Music2,
  Play,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const DETAIL_META = {
  personal: { title: "Personal Information", icon: Heart, color: "#FF2D55" },
  security: { title: "Sign-In & Security", icon: ShieldCheck, color: "#5856D6" },
  payment: { title: "Payment & Shipping", icon: CreditCard, color: "#34C759" },
  subscriptions: { title: "Subscriptions", icon: Play, color: "#AF52DE" },
  icloud: { title: "iCloud", icon: Cloud, color: "#007AFF" },
  media: { title: "Media & Purchases", icon: Music2, color: "#FF2D55" },
  "find-my": { title: "Find My", icon: MapPin, color: "#FF9500" },
  family: { title: "Family", icon: UsersRound, color: "#FF2D55" },
};

function Toggle({ value, onChange, testId, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={Boolean(value)}
      data-testid={testId}
      onClick={() => onChange(!value)}
      className="ios-toggle relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: value ? "#34C759" : "var(--ios-toggle-off)" }}
    >
      <span className={`ios-toggle-knob absolute top-[2px] h-[27px] w-[27px] rounded-full shadow transition-all ${value ? "left-[22px]" : "left-[2px]"}`} />
    </button>
  );
}

function SwitchRow({ label, value, onChange, testId, icon, color = "#8E8E93" }) {
  return (
    <IosRow
      icon={
        icon ? (
          <IosIcon color={color}>{icon}</IosIcon>
        ) : undefined
      }
      label={label}
      value={<Toggle value={value} onChange={onChange} testId={testId} label={label} />}
      chevron={false}
      testId={`${testId}-row`}
    />
  );
}

function EditableRow({ label, value, onChange, type = "text", testId, placeholder }) {
  return (
    <label className="flex min-h-[50px] items-center gap-4 px-4 py-2" style={{ backgroundColor: "var(--ios-surface)" }}>
      <span className="shrink-0 text-[17px] leading-[22px]" style={{ color: "var(--ios-label)" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-right text-[17px] leading-[22px] text-[#007AFF] outline-none placeholder:text-[#8E8E93]"
      />
    </label>
  );
}

function SectionIcon({ meta }) {
  const Icon = meta.icon;
  return (
    <IosIcon color={meta.color}>
      <Icon size={17} strokeWidth={2.1} />
    </IosIcon>
  );
}

function PersonalDetail({ displayName, setDisplayName, email, setEmail }) {
  return (
    <>
      <IosGroup>
        <EditableRow label="Name" value={displayName} onChange={setDisplayName} testId="account-display-name" placeholder="Apple Account" />
        <EditableRow label="Email" value={email} onChange={setEmail} type="email" testId="account-email" placeholder="Not set" />
      </IosGroup>
      <IosSectionFooter>
        These profile values are saved locally for this simulator. They are not submitted to an Apple service.
      </IosSectionFooter>
    </>
  );
}

function SecurityDetail({ alerts, setAlerts, twoFactor, setTwoFactor }) {
  return (
    <>
      <IosGroup>
        <SwitchRow label="Sign-In Alerts" value={alerts} onChange={setAlerts} testId="account-security-alerts" icon={<Bell size={17} strokeWidth={2.1} />} />
        <SwitchRow label="Two-Factor Authentication" value={twoFactor} onChange={setTwoFactor} testId="account-security-two-factor" icon={<KeyRound size={17} strokeWidth={2.1} />} color="#5856D6" />
      </IosGroup>
      <IosGroup>
        <IosInfoRow label="Password" value="Not collected" testId="account-security-password" />
        <IosInfoRow label="Account access" value="Local simulation" testId="account-security-access" />
      </IosGroup>
      <IosSectionFooter>
        Security controls above only change local preferences. No password is requested and no sign-in is performed here.
      </IosSectionFooter>
    </>
  );
}

function PaymentDetail() {
  return (
    <>
      <IosGroup>
        <IosInfoRow label="Payment Methods" value="No payment method" testId="account-payment-method" />
        <IosInfoRow label="Shipping Address" value="Not set" testId="account-shipping-address" />
      </IosGroup>
      <IosSectionFooter>
        Payment &amp; Shipping is information-only in this simulator. No card data, billing action, or purchase submission is available.
      </IosSectionFooter>
    </>
  );
}

function SubscriptionsDetail({ reminders, setReminders }) {
  return (
    <>
      <IosGroup>
        <IosInfoRow label="Active Subscriptions" value="None" testId="account-subscriptions-status" />
        <SwitchRow label="Renewal Reminders" value={reminders} onChange={setReminders} testId="account-subscriptions-reminders" icon={<Bell size={17} strokeWidth={2.1} />} color="#AF52DE" />
      </IosGroup>
      <IosSectionFooter>
        Subscription status is a local placeholder and does not represent a store account or a live entitlement.
      </IosSectionFooter>
    </>
  );
}

function ICloudDetail({ photos, setPhotos, drive, setDrive, notes, setNotes, messages, setMessages, backup, setBackup }) {
  return (
    <>
      <IosGroup>
        <SwitchRow label="Photos" value={photos} onChange={setPhotos} testId="account-icloud-photos" icon={<Cloud size={17} strokeWidth={2.1} />} color="#007AFF" />
        <SwitchRow label="Drive" value={drive} onChange={setDrive} testId="account-icloud-drive" icon={<Download size={17} strokeWidth={2.1} />} color="#007AFF" />
        <SwitchRow label="Notes" value={notes} onChange={setNotes} testId="account-icloud-notes" icon={<Check size={17} strokeWidth={2.1} />} color="#FF9500" />
        <SwitchRow label="Messages" value={messages} onChange={setMessages} testId="account-icloud-messages" icon={<MessageCircle size={17} strokeWidth={2.1} />} color="#34C759" />
        <SwitchRow label="iCloud Backup" value={backup} onChange={setBackup} testId="account-icloud-backup" icon={<LockKeyhole size={17} strokeWidth={2.1} />} color="#5856D6" />
      </IosGroup>
      <IosSectionFooter>
        These switches are local simulation settings only. They do not sync files, messages, or backups to iCloud and do not claim encryption.
      </IosSectionFooter>
    </>
  );
}

function MediaDetail({ cellular, setCellular }) {
  return (
    <>
      <IosGroup>
        <SwitchRow label="Automatic Downloads" value={cellular} onChange={setCellular} testId="account-media-downloads" icon={<Download size={17} strokeWidth={2.1} />} color="#FF2D55" />
        <IosInfoRow label="Purchase History" value="No local entries" testId="account-media-history" />
      </IosGroup>
      <IosSectionFooter>
        Media preferences are local only. This page does not sell, restore, or claim access to purchases.
      </IosSectionFooter>
    </>
  );
}

function FindMyDetail({ findMy, setFindMy, location, setLocation }) {
  return (
    <>
      <IosGroup>
        <SwitchRow label="Find My iPhone" value={findMy} onChange={setFindMy} testId="account-find-my-device" icon={<MapPin size={17} strokeWidth={2.1} />} color="#FF9500" />
        <SwitchRow label="Location Sharing" value={location} onChange={setLocation} testId="account-find-my-location" icon={<MapPin size={17} strokeWidth={2.1} />} color="#FF9500" />
      </IosGroup>
      <IosSectionFooter>
        Find My controls are simulated locally. No device location is collected or shared from this screen.
      </IosSectionFooter>
    </>
  );
}

function FamilyDetail({ family, setFamily }) {
  return (
    <>
      <IosGroup>
        <SwitchRow label="Family Sharing" value={family} onChange={setFamily} testId="account-family-sharing" icon={<UsersRound size={17} strokeWidth={2.1} />} color="#FF2D55" />
        <IosInfoRow label="Family Members" value="Not configured" testId="account-family-members" />
      </IosGroup>
      <IosSectionFooter>
        Family settings are a local preview. No invitations, member records, or account changes are sent.
      </IosSectionFooter>
    </>
  );
}

export default function AppleAccountDetail() {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const { section = "" } = useParams();
  const { auth } = useAuth();
  const meta = DETAIL_META[section];
  const backPath = routeLocation.state?.from === "/settings" ? "/settings" : "/account";

  const [displayName, setDisplayName] = usePreference("account.displayName", auth?.username || "Apple Account");
  const [email, setEmail] = usePreference("account.email", auth?.email || "");
  const [alerts, setAlerts] = usePreference("account.security.alerts", true);
  const [twoFactor, setTwoFactor] = usePreference("account.security.twoFactor", false);
  const [reminders, setReminders] = usePreference("account.subscriptions.reminders", false);
  const [photos, setPhotos] = usePreference("account.icloud.photos", true);
  const [drive, setDrive] = usePreference("account.icloud.drive", true);
  const [notes, setNotes] = usePreference("account.icloud.notes", true);
  const [messages, setMessages] = usePreference("account.icloud.messages", true);
  const [backup, setBackup] = usePreference("account.icloud.backup", false);
  const [cellular, setCellular] = usePreference("account.media.automaticDownloads", false);
  const [findMy, setFindMy] = usePreference("account.findMy.device", true);
  const [location, setLocation] = usePreference("account.findMy.location", false);
  const [family, setFamily] = usePreference("account.family.sharing", false);

  if (!meta) {
    return (
      <div className="pb-10" data-testid="apple-account-detail-unavailable">
        <NavHeader title="Apple Account" onBack={() => navigate(backPath)} backLabel={backPath === "/settings" ? "Settings" : "Apple Account"} />
        <div className="px-8 pt-10 text-center text-[15px] leading-5" style={{ color: "var(--ios-secondary)" }}>This account section is not available.</div>
      </div>
    );
  }

  const content = {
    personal: <PersonalDetail displayName={displayName} setDisplayName={setDisplayName} email={email} setEmail={setEmail} />,
    security: <SecurityDetail alerts={alerts} setAlerts={setAlerts} twoFactor={twoFactor} setTwoFactor={setTwoFactor} />,
    payment: <PaymentDetail />,
    subscriptions: <SubscriptionsDetail reminders={reminders} setReminders={setReminders} />,
    icloud: <ICloudDetail photos={photos} setPhotos={setPhotos} drive={drive} setDrive={setDrive} notes={notes} setNotes={setNotes} messages={messages} setMessages={setMessages} backup={backup} setBackup={setBackup} />,
    media: <MediaDetail cellular={cellular} setCellular={setCellular} />,
    "find-my": <FindMyDetail findMy={findMy} setFindMy={setFindMy} location={location} setLocation={setLocation} />,
    family: <FamilyDetail family={family} setFamily={setFamily} />,
  }[section];

  return (
    <div className="pb-10" data-testid={`apple-account-detail-${section}`}>
      <NavHeader title={meta.title} onBack={() => navigate(backPath)} backLabel={backPath === "/settings" ? "Settings" : "Apple Account"} />
      <div className="space-y-6 pt-1">
        <IosGroup>
          <IosRow icon={<SectionIcon meta={meta} />} label={meta.title} value="Local settings" chevron={false} testId="account-detail-heading" />
        </IosGroup>
        {content}
      </div>
    </div>
  );
}
