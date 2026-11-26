import { useMemo, useState } from "react";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { BarChart, DonutStat, ProCard, ProTable, ProTabs } from "./ProUi";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "earnings", label: "Earnings" },
  { id: "jobs", label: "Jobs" },
  { id: "activity", label: "Activity" },
];

export default function ProReports() {
  const [tab, setTab] = useState("overview");
  const { loading, bookings, earnings, bids, ledger, earningsByMonth, categoryMix } = useProData();

  const activityRows = useMemo(
    () =>
      ledger.map((row) => ({
        id: row.id,
        date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
        kind: row.kind,
        note: row.note || "—",
        amount: row.amount > 0 ? `+${row.amount}` : String(row.amount),
      })),
    [ledger],
  );

  const jobRows = useMemo(
    () =>
      bids.map((b) => ({
        id: b.id,
        title: b.job_title,
        amount: `$${Number(b.amount).toLocaleString()}`,
        status: b.status,
        customer: b.customer_name,
      })),
    [bids],
  );

  return (
    <ProDashboardLayout title="Reports" subtitle="Export-ready performance from bookings and credits." wide>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProTabs tabs={TABS} active={tab} onChange={setTab} />
        <p className="text-sm font-semibold text-[#64748b]">Total earnings: ${earnings.toLocaleString()}</p>
      </div>
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading reports…</p>
      ) : (
        <>
          {(tab === "overview" || tab === "earnings") && (
            <div className="grid gap-6 lg:grid-cols-2">
              <ProCard>
                <h2 className="text-base font-bold text-[#0b1220]">Monthly earnings</h2>
                <div className="mt-6">
                  <BarChart data={earningsByMonth.length ? earningsByMonth : [{ label: "—", value: 0 }]} />
                </div>
              </ProCard>
              <ProCard>
                <h2 className="text-base font-bold text-[#0b1220]">Category mix</h2>
                <div className="mt-6">
                  <DonutStat segments={categoryMix} />
                </div>
              </ProCard>
            </div>
          )}
          {tab === "jobs" && (
            <ProTable
              columns={[
                { key: "title", label: "Customer post" },
                { key: "customer", label: "Customer" },
                { key: "amount", label: "Quote" },
                { key: "status", label: "Status" },
              ]}
              rows={jobRows}
              empty="No quotes sent yet — open Find Jobs."
            />
          )}
          {tab === "activity" && (
            <ProTable
              columns={[
                { key: "date", label: "Date" },
                { key: "kind", label: "Type" },
                { key: "note", label: "Note" },
                { key: "amount", label: "Credits" },
              ]}
              rows={activityRows}
              empty="No credit activity yet."
            />
          )}
          {tab === "overview" && bookings.length > 0 && (
            <p className="mt-4 text-sm text-[#64748b]">{bookings.length} bookings on file · {bids.length} quotes sent</p>
          )}
        </>
      )}
    </ProDashboardLayout>
  );
}