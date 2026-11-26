import { useEffect, useState } from "react";
import client from "../../api/client";

export default function BusinessProfileForm() {
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

  if (!form) return <p className="text-sm text-[#64748b]">Loading profile…</p>;

  const field =
    "mt-1 w-full rounded-xl border border-[#E7EAF0] bg-white px-3 py-2 text-sm text-[#0b1220] outline-none focus:border-[#5b46f5]";

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <div className="mb-2">
        <h2 className="text-base font-bold text-[#0b1220]">Business profile</h2>
        <p className="text-[13px] text-[#64748b]">Updates your public pro profile.</p>
      </div>
      <label className="block text-sm font-semibold text-[#334155]">
        Business name
        <input
          value={form.business_name}
          onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          className={field}
        />
      </label>
      <label className="block text-sm font-semibold text-[#334155]">
        Tagline
        <input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} className={field} />
      </label>
      <label className="block text-sm font-semibold text-[#334155]">
        About
        <textarea value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} rows={4} className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[#334155]">
          Years of experience
          <input
            type="number"
            value={form.years_experience}
            onChange={(e) => setForm((f) => ({ ...f, years_experience: Number(e.target.value) }))}
            className={field}
          />
        </label>
        <label className="block text-sm font-semibold text-[#334155]">
          City
          <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={field} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-[#334155]">
        License number
        <input
          value={form.license_number}
          onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
          className={field}
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#334155]">
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
      <label className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
        <input
          type="checkbox"
          checked={form.is_available}
          onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
        />
        Accepting new bookings
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="h-11 rounded-xl bg-[#5b46f5] px-5 text-sm font-semibold text-white">
          Save changes
        </button>
        {saved && <span className="text-sm text-[#15803D]">Saved!</span>}
      </div>
    </form>
  );
}