import { Link } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useProData } from "./useProData";
import { ProTabs, press } from "./ProUi";
import { photoForItem } from "../../lib/photos";
import { useState } from "react";

const TABS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
];

export default function ProProfile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("about");
  const { loading, profile, portfolio, reviews, credits } = useProData({ refreshMs: 0 });

  const initial = (user?.full_name || "U").charAt(0).toUpperCase();
  const skills = (profile?.services || []).map((s) => s.title).filter(Boolean);
  const used = new Set();

  return (
    <ProDashboardLayout title="Profile" subtitle="Data from /providers/me, /credits/pro/portfolio, /credits/pro/reviews." wide>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[24px] border border-[#E7EAF0] bg-white p-6 text-center">
          <span className="mx-auto inline-flex size-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5b46f5,#3b82f6)] text-3xl font-bold text-white">
            {initial}
          </span>
          <p className="mt-4 text-lg font-bold text-[#0b1220]">{user?.full_name}</p>
          <p className="mt-1 text-sm text-[#64748b]">{profile?.business_name}</p>
          <span className="mt-2 inline-flex rounded-full bg-[#EDE9FE] px-3 py-1 text-[11px] font-bold uppercase text-[#6D28D9]">
            {credits?.subscription_status === "active" ? "Pro plan active" : "Pro member"}
          </span>
          <Link
            to="/pro/settings"
            className={`${press} mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#E7EAF0] text-sm font-semibold text-[#334155]`}
          >
            Edit in Settings
          </Link>
        </div>
        <div className="min-w-0">
          <ProTabs tabs={TABS} active={tab} onChange={setTab} />
          <div className="mt-5 rounded-[24px] border border-[#E7EAF0] bg-white p-6">
            {loading && <p className="text-sm text-[#64748b]">Loading…</p>}
            {!loading && tab === "about" && (
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={user?.full_name} />
                <Field label="Email" value={user?.email} />
                <Field label="Business" value={profile?.business_name} />
                <Field
                  label="Location"
                  value={[profile?.city, profile?.state].filter(Boolean).join(", ") || "California"}
                />
                <Field label="Rating" value={profile?.avg_rating ? `${profile.avg_rating} (${profile.review_count} reviews)` : "—"} />
                <div className="sm:col-span-2">
                  <Field label="About" value={profile?.about || profile?.tagline || "Add your story in Settings."} />
                </div>
              </dl>
            )}
            {!loading && tab === "skills" && (
              <div className="flex flex-wrap gap-2">
                {skills.length === 0 && <p className="text-sm text-[#64748b]">Add services under Availability.</p>}
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-[#F1F5F9] px-3 py-1.5 text-[13px] font-semibold text-[#334155]">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {!loading && tab === "portfolio" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolio.length === 0 && (
                  <p className="text-sm text-[#64748b] sm:col-span-2">Send quotes on customer posts to build your portfolio.</p>
                )}
                {portfolio.map((item) => {
                  const img = item.image || photoForItem({ title: item.title, category: item.category }, used);
                  return (
                    <Link
                      key={item.job_id || item.booking_id}
                      to={item.job_id ? `/listings/${item.job_id}` : "/pro/bookings"}
                      className="overflow-hidden rounded-2xl border border-[#EEF2F7]"
                    >
                      <img src={img} alt="" className="h-28 w-full object-cover" />
                      <div className="p-3">
                        <p className="font-semibold text-[#0b1220]">{item.title}</p>
                        <p className="text-[12px] text-[#64748b]">
                          {item.status} · ${Number(item.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            {!loading && tab === "reviews" && (
              <ul className="space-y-3">
                {reviews.length === 0 && <p className="text-sm text-[#64748b]">No reviews yet — complete jobs to get rated.</p>}
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-[#EEF2F7] p-4">
                    <p className="font-semibold text-[#0b1220]">
                      {"★".repeat(r.rating)}
                      <span className="ml-2 text-sm font-normal text-[#64748b]">{r.customer_name}</span>
                    </p>
                    <p className="mt-2 text-sm text-[#334155]">{r.comment || "—"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProDashboardLayout>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium text-[#0b1220]">{value || "—"}</dd>
    </div>
  );
}