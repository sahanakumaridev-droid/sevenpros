import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import client from "../api/client";

const STEPS = ["Details", "Payment", "Confirmed"];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function Booking() {
  const { providerId, serviceId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    scheduled_date: tomorrow(),
    scheduled_time: "10:00",
    address_line: "1250 Market St, San Francisco, CA 94102",
    notes: "",
    is_emergency: false,
  });
  const [payment, setPayment] = useState({
    tip: 0,
    coupon_code: "",
    card: "4242 4242 4242 4242",
    name: "Maria Garcia",
    expiry: "12/28",
    cvc: "123",
  });

  useEffect(() => {
    client.get(`/providers/${providerId}`).then((res) => {
      setProvider(res.data);
      setService(res.data.services.find((s) => s.id === serviceId) || res.data.services[0]);
    });
  }, [providerId, serviceId]);

  const subtotal = useMemo(() => service?.price_min || 0, [service]);
  const total = subtotal + Number(payment.tip || 0);

  const submitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await client.post("/bookings", {
        provider_id: providerId,
        service_id: service.id,
        ...form,
      });
      setBooking(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create booking. Sign in and try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setError("");
    if ((payment.card || "").replace(/\s/g, "").length < 12) {
      setError("Enter a demo card number (4242 4242 4242 4242).");
      return;
    }
    setBusy(true);
    try {
      await client.post("/payments/charge", {
        booking_id: booking.id,
        amount: booking.quoted_price || subtotal,
        tip: Number(payment.tip) || 0,
        coupon_code: payment.coupon_code || null,
        method: "demo_card",
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Payment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!provider || !service) return <div className="container-page py-16 text-faint">Loading checkout…</div>;

  return (
    <div className="container-page py-10 max-w-2xl">
      <Link viewTransition to={`/providers/${providerId}`} className="text-sm text-cyan hover:underline">
        ← Back to listing
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Complete your booking</h1>
      <p className="text-muted text-sm mt-1">Listing → details → payment. Demo checkout — no real charge.</p>

      <div className="flex items-center gap-2 my-8 text-sm overflow-x-auto">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <div
              className={`size-7 rounded-full grid place-items-center text-xs font-bold ${
                step > i ? "bg-brand-grad text-white" : "bg-overlay text-faint"
              }`}
            >
              {i + 1}
            </div>
            <span className={step > i ? "font-medium" : "text-faint"}>{label}</span>
            {i < 2 && <span className="w-8 h-px bg-line mx-1" />}
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <div className="font-semibold">{provider.business_name}</div>
        <div className="text-sm text-muted">{service.title}</div>
        <div className="text-sm text-cyan mt-1 tabular-nums">
          {service.price_type === "quote" ? "Free quote" : `$${service.price_min}${service.price_max ? `–$${service.price_max}` : ""}`}
        </div>
      </div>

      {error && (
        <div className="bg-[#2a1c14] text-danger text-sm rounded-md px-4 py-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={submitBooking} className="step-panel space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted">Date</label>
              <input
                type="date"
                required
                value={form.scheduled_date}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                className="mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted">Time</label>
              <input
                type="time"
                required
                value={form.scheduled_time}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))}
                className="mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Service address</label>
            <input
              required
              value={form.address_line}
              onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Notes for the pro</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_emergency}
              onChange={(e) => setForm((f) => ({ ...f, is_emergency: e.target.checked }))}
            />
            Emergency / same-day request
          </label>
          <button type="submit" disabled={busy} className="btn btn-primary w-full h-12 rounded-xl">
            {busy ? "Saving…" : "Continue to payment"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitPayment} className="step-panel space-y-4">
          <div className="rounded-xl border border-line p-4 text-sm text-muted">
            Demo card is prefilled. Use <span className="font-mono text-ink">4242 4242 4242 4242</span> — nothing is charged.
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Name on card</label>
            <input
              required
              value={payment.name}
              onChange={(e) => setPayment((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Card number</label>
            <input
              required
              inputMode="numeric"
              value={payment.card}
              onChange={(e) => setPayment((p) => ({ ...p, card: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted">Expiry</label>
              <input
                required
                value={payment.expiry}
                onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))}
                className="mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted">CVC</label>
              <input
                required
                value={payment.cvc}
                onChange={(e) => setPayment((p) => ({ ...p, cvc: e.target.value }))}
                className="mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted">Tip (optional)</label>
            <input
              type="number"
              min="0"
              value={payment.tip}
              onChange={(e) => setPayment((p) => ({ ...p, tip: e.target.value }))}
              className="mt-1 w-full border px-3 py-2.5 text-base"
            />
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-line">
            <span>Total due</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full h-12 rounded-xl">
            {busy ? "Processing…" : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="step-panel text-center py-10 card px-6">
          <img src="/logo-mark.png" alt="" className="size-14 rounded-xl mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Booking confirmed</h2>
          <p className="text-muted mb-6">
            {provider.business_name} will confirm your {service.title.toLowerCase()} visit. Payment status: paid (demo).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={() => navigate("/account/bookings")} className="btn btn-primary px-6 h-11 rounded-xl">
              View my bookings
            </button>
            <Link viewTransition to="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-line font-semibold text-sm">
              Back home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
