import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../context/AuthContext";
import { photoForItem } from "../../lib/photos";
import { useProData } from "./useProData";
import { BarChart } from "./ProUi";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const QUICK_ACTIONS = [
  { label: "Find Jobs", to: "/pro/leads", tone: "bg-[#EDE9FE] text-[#6D28D9]" },
  { label: "Analytics", to: "/pro/analytics", tone: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { label: "My Earnings", to: "/pro/payments", tone: "bg-[#DCFCE7] text-[#15803D]" },
  { label: "Reports", to: "/pro/reports", tone: "bg-[#FFEDD5] text-[#C2410C]" },
];

export default function ProviderDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const [heroQuery, setHeroQuery] = useState("");
  const {
    loading,
    profile,
    bookings,
    leads,
    inbox,
    earnings,
    completed,
    sentOffers,
    earningsByMonth,
    summary,
  } = useProData({ wideLeads: true, refreshMs: 30000 });

  const inboxItems = inbox.items || [];
  const upcoming = useMemo(
    () => bookings.filter((b) => ["pending", "accepted", "in_progress"].includes(b.status)),
    [bookings],
  );
  const usedPhotos = new Set();

  const stats = [
    {
      label: "Active Leads",
      value: summary?.open_leads ?? leads.length,
      icon: "⚡",
      tone: "bg-[#EDE9FE] text-[#6D28D9]",
      to: "/pro/leads",
    },
    { label: "Sent Offers", value: sentOffers, icon: "📤", tone: "bg-[#DBEAFE] text-[#1D4ED8]", to: "/pro/reports" },
    {
      label: "Won Jobs",
      value: summary?.completed_jobs ?? completed.length,
      icon: "✓",
      tone: "bg-[#DCFCE7] text-[#15803D]",
      to: "/pro/bookings",
    },
    {
      label: "Rating",
      value:
        summary?.avg_rating != null && summary.review_count > 0
          ? Number(summary.avg_rating).toFixed(1)
          : profile?.avg_rating != null
            ? Number(profile.avg_rating).toFixed(1)
            : "—",
      icon: "★",
      tone: "bg-[#FFEDD5] text-[#C2410C]",
      to: "/pro/profile",
    },
  ];

  const onHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    navigate(q ? `/pro/leads?q=${encodeURIComponent(q)}` : "/pro/leads");
  };

  const earningsFmt = loading ? "—" : `$${Number(earnings).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const chartData = earningsByMonth.length ? earningsByMonth : [{ label: "—", value: 0 }];

  return (
    <DashboardShell role="pro">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(105deg,#1d4ed8_0%,#4f46e5_45%,#7c3aed_100%)] p-6 text-white shadow-[0_24px_56px_rgba(37,99,235,0.28)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 88% 30%, rgba(255,255,255,0.45), transparent 42%), radial-gradient(circle at 12% 80%, rgba(34,211,238,0.25), transparent 38%)",
            }}
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.04em] sm:text-[2rem]">
                Welcome back, {firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/85">
                Find new job opportunities and grow your business.
              </p>
              <form onSubmit={onHeroSearch} className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Search jobs, locations or services…"
                  className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-[14px] text-[#0b1220] shadow-[0_8px_24px_rgba(15,23,42,0.12)] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className={`${press} inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#0b1220] px-6 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]`}
                >
                  Search Jobs →
                </button>
              </form>
            </div>
            <div className="relative hidden overflow-hidden rounded-2xl ring-1 ring-white/25 sm:block lg:min-h-[200px]">
              <img src="/hero-pro.png?v=logo-shirt-no-hat" alt="" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#4f46e5]/20 to-[#1d4ed8]/55" />
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.35fr)]">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className={`${press} rounded-2xl border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex size-8 items-center justify-center rounded-lg text-sm ${s.tone}`}>{s.icon}</span>
                <span className="text-[12px] font-semibold text-[#64748b]">{s.label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-[-0.04em]">{loading ? "—" : s.value}</p>
            </Link>
          ))}
          <Link
            to="/pro/bookings"
            className={`${press} rounded-2xl border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] lg:col-span-1`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-[#64748b]">Total Earnings</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">{earningsFmt}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#64748b]">From accepted jobs</p>
              </div>
              <div className="flex h-14 items-end gap-0.5 pt-1">
                {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-t bg-[linear-gradient(180deg,#86efac,#22c55e)]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </Link>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6 min-w-0">
            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[1.1rem] font-bold tracking-[-0.02em]">New Job Leads</h2>
                <Link to="/pro/leads" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {loading && <p className="text-sm text-[#64748b]">Loading…</p>}
              {!loading && leads.length === 0 && (
                <p className="rounded-2xl bg-[#F8FAFC] p-6 text-sm text-[#64748b]">
                  No open leads nearby yet. Check back soon or widen your service area.
                </p>
              )}
              <ul className="grid gap-4 sm:grid-cols-2">
                {leads.slice(0, 2).map((job) => {
                  const img = photoForItem(job, usedPhotos);
                  const location = [job.city, job.state || job.region].filter(Boolean).join(", ") || "Nearby";
                  const budget =
                    job.budget_min || job.budget_max
                      ? `$${job.budget_min || "?"} – $${job.budget_max || "?"}`
                      : "Budget on request";
                  return (
                    <li
                      key={job.id}
                      className="overflow-hidden rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#E2E8F0]">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0b1220]">
                          {timeAgo(job.created_at)}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-[#0b1220]">{job.title}</p>
                        <p className="mt-1 text-[12px] text-[#64748b]">
                          {location} · {budget}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-[#94A3B8]">
                          {job.bid_count ?? job.slots_left ?? "—"} proposals
                        </p>
                        <Link
                          to={`/listings/${job.id}`}
                          className={`${press} mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#5b46f5] text-[13px] font-bold text-white`}
                        >
                          Send Offer →
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
              <h2 className="mb-4 text-[1.1rem] font-bold tracking-[-0.02em]">My Performance</h2>
              <div className="mb-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-[12px] font-semibold text-[#64748b]">Earnings</p>
                  <p className="text-xl font-bold">{earningsFmt}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#64748b]">Completed Jobs</p>
                  <p className="text-xl font-bold">{loading ? "—" : completed.length}</p>
                </div>
                <p className="self-end text-[13px] font-semibold text-[#64748b]">
                  {summary?.quotes_sent ?? sentOffers} quotes sent
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <BarChart data={chartData} />
              </div>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <h2 className="mb-4 text-[1.05rem] font-bold">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {QUICK_ACTIONS.map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className={`${press} flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] px-3 py-5 text-center`}
                  >
                    <span className={`inline-flex size-11 items-center justify-center rounded-xl text-lg font-bold ${a.tone}`}>
                      {a.label.charAt(0)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#334155]">{a.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <h2 className="text-[1.05rem] font-bold">Need Help?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                Our support team is here for bookings, payments, and your pro account.
              </p>
              <Link
                to="/info/help-center"
                className={`${press} mt-4 inline-flex text-[13px] font-bold text-[#5b46f5] hover:underline`}
              >
                Contact Support →
              </Link>
            </section>

            <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0f172a,#312e81)] p-5 text-white shadow-[0_16px_40px_rgba(49,46,129,0.35)]">
              <p className="text-[1.05rem] font-bold">Grow Your Business</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/80">Unlock premium leads and stand out in your area.</p>
              <Link
                to="/pro/subscription"
                className={`${press} mt-4 inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13px] font-bold text-[#312e81]`}
              >
                Go Premium →
              </Link>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.05rem] font-bold">Recent Messages</h2>
                <Link to="/pro/messages" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {!loading && inboxItems.length === 0 && (
                <p className="rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#64748b]">No new messages.</p>
              )}
              <ul className="space-y-2.5">
                {inboxItems.slice(0, 3).map((item, idx) => (
                  <li key={item.job_id || idx}>
                    <Link
                      to={item.job_id ? `/listings/${item.job_id}` : "/pro/messages"}
                      className={`${press} flex items-center gap-3 rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] px-3 py-3`}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[12px] font-bold text-[#1D4ED8]">
                        {(item.from_name || item.title || "M").charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{item.from_name || item.title || "Message"}</span>
                        <span className="block truncate text-[11px] text-[#64748b]">{item.body || "Open conversation"}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.05rem] font-bold">Upcoming Jobs</h2>
                <Link to="/pro/bookings" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {!loading && upcoming.length === 0 && (
                <p className="rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#64748b]">No upcoming jobs yet.</p>
              )}
              <ul className="space-y-2.5">
                {upcoming.slice(0, 2).map((b) => (
                  <li key={b.id} className="rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] px-4 py-3.5">
                    <p className="font-semibold text-[#0b1220]">{b.service?.title || "Job"}</p>
                    <p className="mt-0.5 text-[12px] text-[#64748b]">
                      {b.customer?.full_name || "Customer"}
                      {b.final_price || b.quoted_price ? ` · $${Number(b.final_price || b.quoted_price).toFixed(0)}` : ""}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[11px] font-bold capitalize text-[#1D4ED8]">
                      {(b.status || "").replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}