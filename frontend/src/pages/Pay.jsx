import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const money = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function Pay() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const purpose = params.get("purpose") || "";
    const body = {
      purpose,
      pack: params.get("pack") || "",
      booking_id: params.get("booking_id") || "",
    };
    client
      .post("/payments/checkout", body)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Could not start checkout"));
  }, [user, params.get("purpose"), params.get("pack"), params.get("booking_id")]);

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await client.post(`/payments/checkout/${order.id}/confirm`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Payment could not be completed");
    } finally {
      setBusy(false);
    }
  };

  const next = order?.purpose === "booking" ? "/account/bookings" : order?.purpose === "subscription" ? "/pro/leads" : "/credits";

  return (
    <div className="bg-[#f3f4f6] text-[#14181d] min-h-[70vh]">
      <div className="container-page py-10 max-w-lg">
        <p className="text-[13px] font-semibold text-[#0b7c73]">Checkout</p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-[-0.04em]">Review and pay</h1>
        {!user && (
          <Link to={`/login?next=/pay?${params.toString()}`} className="mt-6 inline-flex h-11 items-center rounded-full bg-[#14181d] px-5 text-sm font-semibold text-white">
            Sign in to pay
          </Link>
        )}
        {error && <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-[#9a3412]">{error}</p>}
        {user && !order && !error && <p className="mt-6 text-sm text-[#5c6770]">Preparing your order…</p>}
        {order && order.status !== "paid" && (
          <div className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,32,0.06)]">
            <p className="text-sm text-[#5c6770]">You are buying</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">{order.label}</p>
            <div className="mt-5 flex items-end justify-between border-t border-[#e6e8eb] pt-4">
              <span className="text-sm text-[#5c6770]">Total</span>
              <span className="text-3xl font-semibold tabular-nums tracking-[-0.04em]">{money(order.amount_cents)}</span>
            </div>
            {order.platform_fee_cents > 0 && (
              <p className="mt-3 rounded-xl bg-[#f6f7f8] px-3 py-2 text-xs text-[#5c6770]">
                Includes SevenPros platform fee {money(order.platform_fee_cents)} (marketplace revenue).
              </p>
            )}
            <button type="button" disabled={busy} onClick={confirm} className="mt-6 h-12 w-full rounded-full bg-[#14181d] text-[15px] font-semibold text-white active:scale-[0.98]">
              {busy ? "Confirming…" : `Pay ${money(order.amount_cents)}`}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-[#5c6770]">
              Demo checkout — no real card charge. Confirm delivers credits, Pro plan, or marks the booking paid.
            </p>
          </div>
        )}
        {order?.status === "paid" && (
          <div className="mt-6 rounded-[28px] bg-white p-6 text-center shadow-[0_12px_40px_rgba(15,23,32,0.06)]">
            <p className="text-sm font-semibold text-[#0b7c73]">Paid</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{order.label}</h2>
            <p className="mt-2 text-sm text-[#5c6770]">{money(order.amount_cents)} recorded. Demo mode — no card charged.</p>
            <Link
              to={order.purpose === "booking" && order.booking_id ? `/account/bookings/${order.booking_id}` : next}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[#14181d] px-5 text-sm font-semibold text-white"
            >
              Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
