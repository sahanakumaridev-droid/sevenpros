import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

const TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "invoices", label: "Invoices" },
];

export default function CustomerPayments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("transactions");

  useEffect(() => {
    client
      .get("/bookings/mine")
      .then((res) => setBookings(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const paid = useMemo(
    () =>
      bookings.filter(
        (b) => b.payment_status === "paid" || b.status === "completed" || Number(b.final_price) > 0,
      ),
    [bookings],
  );

  const balance = useMemo(
    () => paid.reduce((sum, b) => sum + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
    [paid],
  );

  const rows = tab === "transactions" ? paid : paid.filter((b) => b.status === "completed");

  return (
    <AccountLayout title="Payments" subtitle="Transactions, invoices, and saved payment methods.">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`${press} shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                  tab === t.id ? "bg-[#5b46f5] text-white" : "border border-[#E7EAF0] bg-white text-[#64748b]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && <p className="mt-5 text-sm text-[#64748b]">Loading…</p>}
          {!loading && rows.length === 0 && (
            <div className="mt-5 rounded-[24px] border border-[#E7EAF0] bg-white p-8 text-center text-sm text-[#64748b]">
              No {tab === "transactions" ? "payments" : "invoices"} yet. Complete a booking to see history here.
            </div>
          )}

          <ul className="mt-5 space-y-2.5">
            {rows.map((b) => {
              const amount = Number(b.final_price) || Number(b.quoted_price) || 0;
              const label = b.service?.title || "Project payment";
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#E7EAF0] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0b1220]">
                      {tab === "invoices" ? `Invoice · ${label}` : `Payment · ${label}`}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#64748b]">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"} ·{" "}
                      <span className="capitalize">{(b.status || "").replace("_", " ")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold tabular-nums text-[#0b1220]">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <Link
                      to={`/account/bookings/${b.id}`}
                      className={`${press} text-[12px] font-bold text-[#5b46f5] hover:underline`}
                    >
                      Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <p className="text-[12px] font-semibold text-[#64748b]">Available Balance</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">
              ${loading ? "—" : balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <button
              type="button"
              disabled
              className="mt-4 h-10 w-full rounded-xl bg-[#E7EAF0] text-[13px] font-bold text-[#94A3B8]"
            >
              Withdraw (coming soon)
            </button>
          </section>
          <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <p className="text-[13px] font-bold text-[#0b1220]">Payment Methods</p>
            <PaymentMethodCard brand="Visa" last4="4242" />
            <Link to="/account/profile" className="mt-3 inline-flex text-[12px] font-semibold text-[#5b46f5] hover:underline">
              Manage in Settings →
            </Link>
          </section>
        </aside>
      </div>
    </AccountLayout>
  );
}

function PaymentMethodCard({ brand, last4 }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#EEF2F7] bg-[#F8FAFC] px-3 py-3">
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#DBEAFE] text-[11px] font-bold text-[#1D4ED8]">
        {brand}
      </span>
      <span className="text-[13px] font-semibold text-[#334155]">•••• {last4}</span>
    </div>
  );
}