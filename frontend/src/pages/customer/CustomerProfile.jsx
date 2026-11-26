import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "privacy", label: "Privacy" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
];

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

export default function CustomerProfile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    language: user?.language || "en",
    dark_mode: user?.dark_mode || false,
    notifications_enabled: user?.notifications_enabled ?? true,
  });
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    await client.patch("/users/me", form);
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteAccount = async () => {
    await client.delete("/users/me");
    logout();
    navigate("/");
  };

  const field =
    "mt-1.5 h-11 w-full rounded-xl border border-[#E7EAF0] bg-[#F8FAFC] px-3.5 text-[14px] outline-none focus:border-[#5b46f5] focus:bg-white";

  return (
    <AccountLayout title="Settings" subtitle="Profile, preferences, and account security.">
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`${press} shrink-0 rounded-xl px-4 py-2.5 text-left text-[13px] font-semibold lg:w-full ${
                tab === t.id ? "bg-[#EDE9FE] text-[#5b46f5]" : "text-[#64748b] hover:bg-[#F8FAFC]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <form onSubmit={save} className="rounded-[24px] border border-[#E7EAF0] bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          {tab === "profile" && <ProfileSection user={user} form={form} setForm={setForm} field={field} />}
          {tab === "privacy" && (
            <div className="space-y-4 text-sm text-[#64748b]">
              <p className="font-semibold text-[#0b1220]">Privacy</p>
              <p>Your contact details are only shared with pros you book or message.</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="size-4" />
                Show my first name only to pros before booking
              </label>
            </div>
          )}
          {tab === "notifications" && (
            <div>
              <p className="mb-4 font-semibold text-[#0b1220]">Notifications</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.notifications_enabled}
                  onChange={(e) => setForm((f) => ({ ...f, notifications_enabled: e.target.checked }))}
                />
                Email & push for offers, messages, and booking updates
              </label>
            </div>
          )}
          {tab === "appearance" && (
            <div>
              <p className="mb-4 font-semibold text-[#0b1220]">Appearance</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.dark_mode}
                  onChange={(e) => setForm((f) => ({ ...f, dark_mode: e.target.checked }))}
                />
                Dark mode (beta)
              </label>
              <div className="mt-4">
                <label className="text-sm font-medium text-[#334155]">Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  className={`${field} mt-1`}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          )}
          {tab === "security" && (
            <div>
              <p className="mb-4 font-semibold text-[#0b1220]">Security</p>
              <p className="text-sm text-[#64748b]">Password changes and 2FA are coming soon.</p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-6 text-sm font-semibold text-[#B91C1C] hover:underline"
              >
                Delete my account
              </button>
            </div>
          )}

          {tab !== "security" && (
            <button
              type="submit"
              className={`${press} mt-6 h-11 rounded-xl bg-[#5b46f5] px-6 text-[13px] font-bold text-white`}
            >
              Save Changes
            </button>
          )}
          {saved && <span className="ml-3 text-sm text-[#15803D]">Saved!</span>}
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="This permanently removes your SevenPros account and cannot be undone."
        confirmLabel="Delete account"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
      />
    </AccountLayout>
  );
}

function ProfileSection({ user, form, setForm, field }) {
  const initial = (user?.full_name || "U").charAt(0).toUpperCase();
  return (
    <div>
      <p className="mb-4 font-semibold text-[#0b1220]">Profile Information</p>
      <span className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5b46f5,#3b82f6)] text-xl font-bold text-white">
        {initial}
      </span>
      <p className="mb-3 text-[12px] font-semibold text-[#5b46f5]">Change photo (coming soon)</p>
      <label className="block text-sm font-medium text-[#334155]">
        Full name
        <input
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className={field}
        />
      </label>
      <label className="mt-4 block text-sm font-medium text-[#334155]">
        Email address
        <input value={user?.email || ""} disabled className={`${field} opacity-70`} />
      </label>
    </div>
  );
}
