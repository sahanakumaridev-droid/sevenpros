import { useEffect, useState } from "react";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = {
  category_id: "",
  title: "",
  description: "",
  price_type: "fixed",
  price_min: "",
  price_max: "",
  is_instant_booking: true,
  offers_free_estimate: false,
  is_emergency: false,
};

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    client.get("/providers/me").then((res) => setServices(res.data.services));
  };

  useEffect(() => {
    load();
    client.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({
      category_id: s.category.id,
      title: s.title,
      description: s.description || "",
      price_type: s.price_type,
      price_min: s.price_min,
      price_max: s.price_max || "",
      is_instant_booking: s.is_instant_booking,
      offers_free_estimate: s.offers_free_estimate,
      is_emergency: s.is_emergency,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      price_min: Number(form.price_min) || 0,
      price_max: form.price_max ? Number(form.price_max) : null,
    };
    if (editingId) {
      await client.patch(`/providers/me/services/${editingId}`, payload);
    } else {
      await client.post("/providers/me/services", payload);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await client.delete(`/providers/me/services/${id}`);
    setDeleteId(null);
    load();
  };

  return (
    <ProDashboardLayout title="Availability" subtitle="Manage services via /providers/me/services." wide>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm((s) => !s);
          }}
          className="btn btn-primary h-9 text-sm"
        >
          {showForm ? "Cancel" : "+ Add Service"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#14181d]">Category</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#14181d]">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#14181d]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#14181d]">Price type</label>
              <select
                value={form.price_type}
                onChange={(e) => setForm((f) => ({ ...f, price_type: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="quote">Quote only</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#14181d]">Min price ($)</label>
              <input
                type="number"
                value={form.price_min}
                onChange={(e) => setForm((f) => ({ ...f, price_min: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#14181d]">Max price ($)</label>
              <input
                type="number"
                value={form.price_max}
                onChange={(e) => setForm((f) => ({ ...f, price_max: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-4 text-sm font-semibold text-[#14181d]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_instant_booking}
                onChange={(e) => setForm((f) => ({ ...f, is_instant_booking: e.target.checked }))}
              />
              Instant booking
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.offers_free_estimate}
                onChange={(e) => setForm((f) => ({ ...f, offers_free_estimate: e.target.checked }))}
              />
              Free estimate
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_emergency}
                onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))}
              />
              Emergency service
            </label>
          </div>
          <button type="submit" className="btn btn-primary h-9 text-sm px-5">
            {editingId ? "Update Service" : "Save Service"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {services.length === 0 && <p className="text-sm font-medium text-[#3c4650]">No services listed yet.</p>}
        {services.map((s) => (
          <div key={s.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#14181d]">{s.title}</div>
              <div className="text-xs font-semibold text-[#3c4650]">{s.category.name}</div>
              <div className="text-sm font-semibold text-[#14181d] mt-1">
                {s.price_type === "quote" ? "Quote only" : `$${s.price_min}${s.price_max ? ` - $${s.price_max}` : ""}`}
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => startEdit(s)} className="text-brand-400 font-medium hover:underline">
                Edit
              </button>
              <button onClick={() => setDeleteId(s.id)} className="text-danger font-medium hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete this service?"
        description="Customers will no longer be able to book this listing. This cannot be undone."
        confirmLabel="Delete service"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => remove(deleteId)}
      />
    </ProDashboardLayout>
  );
}
