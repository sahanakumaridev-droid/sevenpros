import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { BarChart, DonutStat, ProCard, StatTiles } from "./ProUi";

export default function ProAnalytics() {
  const { loading, bookings, earnings, completed, conversionRate, profile, earningsByMonth, categoryMix, bids, summary } =
    useProData({ refreshMs: 0 });

  return (
    <ProDashboardLayout title="Analytics" subtitle="Earnings, jobs, and category performance." wide>
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading analytics…</p>
      ) : (
        <div className="space-y-6">
          <StatTiles
            items={[
              { label: "Total Earnings", value: `$${earnings.toLocaleString()}`, hint: "Paid & completed" },
              { label: "Total Jobs", value: bookings.length },
              { label: "Quotes sent", value: summary?.quotes_sent ?? bids.length },
              { label: "Conversion", value: `${conversionRate}%` },
              {
                label: "Avg Rating",
                value: profile?.avg_rating != null ? Number(profile.avg_rating).toFixed(1) : "—",
              },
            ].slice(0, 4)}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ProCard>
              <h2 className="text-base font-bold text-[#0b1220]">Earnings Overview</h2>
              <p className="mt-1 text-[13px] text-[#64748b]">From your bookings</p>
              <div className="mt-6">
                <BarChart data={earningsByMonth.length ? earningsByMonth : [{ label: "—", value: 0 }]} />
              </div>
            </ProCard>
            <ProCard>
              <h2 className="text-base font-bold text-[#0b1220]">Leads & quotes by category</h2>
              <div className="mt-6">
                <DonutStat segments={categoryMix} />
              </div>
            </ProCard>
          </div>
          <ProCard>
            <h2 className="text-base font-bold text-[#0b1220]">Top performing jobs</h2>
            <ul className="mt-4 space-y-3">
              {completed.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-semibold text-[#0b1220]">{b.service?.title || `Job #${b.id}`}</span>
                    <span className="text-[#64748b]">
                      ${Number(b.final_price || b.quoted_price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#EEF2F7]">
                    <div className="h-full w-[85%] rounded-full bg-[#5b46f5]" />
                  </div>
                </li>
              ))}
              {completed.length === 0 && <li className="text-sm text-[#64748b]">Complete jobs to see rankings.</li>}
            </ul>
          </ProCard>
        </div>
      )}
    </ProDashboardLayout>
  );
}