import { useMemo } from "react";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { ProTable, StatTiles } from "./ProUi";

export default function ProPayments() {
  const { loading, bookings, earnings, credits, ledger } = useProData();

  const pending = useMemo(
    () =>
      bookings
        .filter((b) => b.payment_status !== "paid" && ["accepted", "in_progress"].includes(b.status))
        .reduce((s, b) => s + (Number(b.quoted_price) || 0), 0),
    [bookings],
  );

  const rows = useMemo(() => {
    const bookingRows = bookings
      .filter((b) => b.payment_status === "paid" || b.status === "completed")
      .map((b) => ({
        id: b.id,
        date: b.created_at ? new Date(b.created_at).toLocaleDateString() : "—",
        description: b.service?.title || `Booking #${b.id}`,
        amount: `$${(Number(b.final_price) || Number(b.quoted_price) || 0).toLocaleString()}`,
        status: b.payment_status === "paid" || b.status === "completed" ? "Paid" : "Pending",
      }));
    const creditRows = ledger
      .filter((r) => r.kind.includes("purchase") || r.kind.includes("unlock") || r.kind.includes("bid"))
      .map((r) => ({
        id: `l-${r.id}`,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
        description: r.note || r.kind,
        amount: `${r.amount > 0 ? "+" : ""}${r.amount} cr`,
        status: "Ledger",
      }));
    return [...bookingRows, ...creditRows].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [bookings, ledger]);

  const columns = [
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={
            r.status === "Paid"
              ? "font-semibold text-[#15803D]"
              : r.status === "Ledger"
                ? "font-semibold text-[#5b46f5]"
                : "text-[#64748b]"
          }
        >
          {r.status}
        </span>
      ),
    },
  ];

  const nextBilling =
    credits?.subscription_status === "active" ? "Pro plan (active)" : "Pay as you go";

  return (
    <ProDashboardLayout title="Payments & Billing" subtitle="Booking payouts and credit ledger." wide>
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : (
        <div className="space-y-6">
          <StatTiles
            items={[
              { label: "Total Paid", value: `$${earnings.toLocaleString()}` },
              { label: "Pending", value: `$${pending.toLocaleString()}` },
              { label: "Credit balance", value: credits?.balance ?? 0, hint: nextBilling },
            ]}
          />
          <div>
            <h2 className="mb-3 text-base font-bold text-[#0b1220]">Payment & credit history</h2>
            <ProTable columns={columns} rows={rows} empty="No payments yet — accept a customer quote to book." />
          </div>
        </div>
      )}
    </ProDashboardLayout>
  );
}