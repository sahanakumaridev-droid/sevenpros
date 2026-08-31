import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

export default function CustomerProfile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
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

  return (
    <AccountLayout title="Settings">
      <form onSubmit={save} className="space-y-5 max-w-md">
        <div>
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Language</label>
          <select
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.dark_mode}
            onChange={(e) => setForm((f) => ({ ...f, dark_mode: e.target.checked }))}
          />
          Dark mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.notifications_enabled}
            onChange={(e) => setForm((f) => ({ ...f, notifications_enabled: e.target.checked }))}
          />
          Enable notifications
        </label>
        <button type="submit" className="btn btn-primary px-5 h-10">
          Save Changes
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">Saved!</span>}
      </form>

      <div className="mt-10 pt-6 border-t border-line max-w-md">
        <h3 className="text-sm font-semibold text-danger mb-2">Danger zone</h3>
        <button
          onClick={() => setConfirmDelete(true)}
          className="btn h-9 text-sm text-danger border border-line hover:bg-overlay"
        >
          Delete my account
        </button>
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
