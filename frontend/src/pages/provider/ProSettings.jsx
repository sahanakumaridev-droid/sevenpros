import { useState } from "react";
import { Link } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import BusinessProfileForm from "./BusinessProfileForm";
import { press } from "./ProUi";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
  { id: "billing", label: "Billing" },
];

export default function ProSettings() {
  const [section, setSection] = useState("account");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <ProDashboardLayout title="Settings" subtitle="Account, notifications, and preferences.">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`${press} shrink-0 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold lg:w-full ${
                section === s.id ? "bg-[#EDE9FE] text-[#5b46f5]" : "text-[#64748b] hover:bg-[#F8FAFC]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 rounded-[24px] border border-[#E7EAF0] bg-white p-6">
          {section === "account" && <BusinessProfileForm />}
          {section === "notifications" && (
            <div className="max-w-md space-y-4">
              <h2 className="text-base font-bold text-[#0b1220]">Notifications</h2>
              <Toggle label="Email notifications" checked={emailNotif} onChange={setEmailNotif} />
              <Toggle label="Push notifications" checked={pushNotif} onChange={setPushNotif} />
            </div>
          )}
          {section === "security" && (
            <div className="max-w-md space-y-3 text-[13px] text-[#64748b]">
              <h2 className="text-base font-bold text-[#0b1220]">Security</h2>
              <p>Password and two-factor settings are managed from your SevenPros login.</p>
              <Link to="/login" className="font-semibold text-[#5b46f5] hover:underline">
                Open sign-in
              </Link>
            </div>
          )}
          {section === "privacy" && (
            <div className="max-w-md text-[13px] text-[#64748b]">
              <h2 className="text-base font-bold text-[#0b1220]">Privacy</h2>
              <p className="mt-2">Control who can see your portfolio and contact info on your public profile.</p>
            </div>
          )}
          {section === "appearance" && (
            <div className="max-w-md space-y-3">
              <h2 className="text-base font-bold text-[#0b1220]">Appearance</h2>
              <label className="block text-sm font-semibold text-[#334155]">
                Language
                <select className="mt-1 h-11 w-full rounded-xl border border-[#E7EAF0] px-3 text-sm">
                  <option>English (US)</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#334155]">
                Timezone
                <select className="mt-1 h-11 w-full rounded-xl border border-[#E7EAF0] px-3 text-sm">
                  <option>Pacific (PT)</option>
                </select>
              </label>
            </div>
          )}
          {section === "billing" && (
            <div className="max-w-md space-y-3">
              <h2 className="text-base font-bold text-[#0b1220]">Billing</h2>
              <p className="text-[13px] text-[#64748b]">Manage your plan and payment methods.</p>
              <Link to="/pro/subscription" className={`${press} inline-flex h-10 items-center rounded-xl bg-[#5b46f5] px-4 text-sm font-semibold text-white`}>
                Subscription plans
              </Link>
              <Link to="/pro/payments" className="ml-2 text-sm font-semibold text-[#5b46f5] hover:underline">
                Payment history
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProDashboardLayout>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#EEF2F7] px-4 py-3">
      <span className="text-sm font-semibold text-[#334155]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-[#5b46f5]" : "bg-[#CBD5E1]"}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}