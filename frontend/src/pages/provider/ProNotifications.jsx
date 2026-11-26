import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { ProTabs } from "./ProUi";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "message", label: "Messages" },
  { id: "quote", label: "Updates" },
  { id: "alerts", label: "Alerts" },
];

function timeAgo(iso) {
  if (!iso) return "Recently";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ProNotifications() {
  const { loading, inbox, bookings } = useProData({ refreshMs: 20000 });
  const [tab, setTab] = useState("all");

  const items = useMemo(() => {
    const fromInbox = (inbox.items || []).map((item, i) => ({
      id: `inbox-${item.job_id || i}`,
      type: item.kind === "quote" ? "quote" : "message",
      title: item.kind === "quote" ? "Quote activity" : "New message",
      body: item.body || item.title,
      when: item.at,
      to: item.job_id ? `/listings/${item.job_id}` : "/pro/leads",
      unread: item.unread,
    }));
    const alerts = bookings
      .filter((b) => b.status === "pending")
      .map((b) => ({
        id: `alert-${b.id}`,
        type: "alerts",
        title: "New booking request",
        body: b.service?.title || `Booking #${b.id}`,
        when: b.created_at,
        to: "/pro/bookings",
        unread: true,
      }));
    return [...fromInbox, ...alerts].sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0));
  }, [inbox, bookings]);

  const filtered = items.filter((item) => tab === "all" || item.type === tab);

  return (
    <ProDashboardLayout title="Notifications" subtitle="Inbox, quotes, and booking alerts from the API." wide>
      <ProTabs tabs={FILTERS} active={tab} onChange={setTab} />
      <ul className="mt-5 space-y-2">
        {loading && <li className="text-sm text-[#64748b]">Loading…</li>}
        {!loading && filtered.length === 0 && (
          <li className="rounded-[20px] border border-[#E7EAF0] bg-white p-8 text-center text-sm text-[#64748b]">
            You&apos;re all caught up.
          </li>
        )}
        {filtered.map((item) => (
          <li key={item.id}>
            <Link
              to={item.to}
              className={`flex gap-4 rounded-[20px] border px-4 py-3.5 ${
                item.unread ? "border-[#C7D2FE] bg-[#F5F3FF]" : "border-[#E7EAF0] bg-white"
              } hover:border-[#5b46f5]`}
            >
              <span
                className={`mt-0.5 size-2 shrink-0 rounded-full ${item.unread ? "bg-[#5b46f5]" : "bg-[#CBD5E1]"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0b1220]">{item.title}</p>
                <p className="mt-0.5 truncate text-[13px] text-[#64748b]">{item.body}</p>
              </div>
              <span className="shrink-0 text-[12px] text-[#94A3B8]">{timeAgo(item.when)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ProDashboardLayout>
  );
}