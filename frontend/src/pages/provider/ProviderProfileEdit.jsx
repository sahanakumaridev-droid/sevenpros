import { useEffect, useState } from "react";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";

export default function ProviderProfileEdit() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get("/providers/me").then((res) => {
      const p = res.data;
      setForm({
        business_name: p.business_name,
        tagline: p.tagline || "",
        about: p.about || "",
        years_experience: p.years_experience,
        is_licensed: p.is_licensed,
        license_number: p.license_number || "",
        is_insured: p.is_insured,
        is_background_checked: p.is_background_checked,
        city: p.city || "",
        state: p.state,
        is_available: p.is_available,
        website: p.website || "",
      });
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.patch("/providers/me", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!form) return <ProDashboardLayout title="Business Profile"><div className="text-gray-400">Loading...</div></ProDashboardLayout>;

  return (
    <ProDashboardLayout title="Business Profile">
      <form onSubmit={submit} className="space-y-5 max-w-xl">
        <div>
          <label className="text-sm font-medium text-gray-700">Business name</label>
          <input
            value={form.business_name}
            onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tagline</label>
          <input
            value={form.tagline}
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">About</label>
          <textarea
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Years of experience</label>
            <input
              type="number"
              value={form.years_experience}
              onChange={(e) => setForm((f) => ({ ...f, years_experience: Number(e.target.value) }))}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">License number</label>
          <input
            value={form.license_number}
            onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_licensed}
              onChange={(e) => setForm((f) => ({ ...f, is_licensed: e.target.checked }))}
            />
            Licensed
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_insured}
              onChange={(e) => setForm((f) => ({ ...f, is_insured: e.target.checked }))}
            />
            Insured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_background_checked}
              onChange={(e) => setForm((f) => ({ ...f, is_background_checked: e.target.checked }))}
            />
            Background checked
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
          />
          Currently accepting bookings (turn off for vacation mode)
        </label>

        <button type="submit" className="btn btn-primary px-5 h-10">
          Save Changes
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">Saved!</span>}
      </form>
    </ProDashboardLayout>
  );
}
