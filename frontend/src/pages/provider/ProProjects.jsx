import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { press } from "./ProUi";
import { photoForItem } from "../../lib/photos";

const STATUS_FILTER = ["All", "In progress", "Completed"];

function progressFor(status) {
  if (status === "completed" || status === "accepted") return 100;
  if (status === "in_progress") return 75;
  if (status === "pending") return 50;
  return 30;
}

export default function ProProjects() {
  const { loading, bookings, bids, leads } = useProData();
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");

  const projects = useMemo(() => {
    const fromBookings = bookings.map((b) => ({
      id: `b-${b.id}`,
      title: b.service?.title || `Booking #${b.id}`,
      status: b.status,
      progress: progressFor(b.status),
      customer: b.customer?.full_name || "Customer",
      to: `/pro/bookings`,
      image: null,
    }));
    const fromBids = bids.map((b) => ({
      id: `bid-${b.id}`,
      title: b.job_title || "Customer post",
      status: b.status === "accepted" ? "completed" : "in_progress",
      progress: progressFor(b.status === "accepted" ? "completed" : "pending"),
      customer: b.customer_name,
      to: `/listings/${b.job_id}`,
      image: leads.find((l) => l.id === b.job_id)?.image,
      category: b.job_category,
    }));
    return [...fromBids, ...fromBookings];
  }, [bookings, bids, leads]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchQ = !q.trim() || p.title.toLowerCase().includes(q.toLowerCase());
      const matchS =
        status === "All" ||
        (status === "Completed" && (p.status === "completed" || p.progress >= 100)) ||
        (status === "In progress" && p.status !== "completed" && p.status !== "cancelled");
      return matchQ && matchS;
    });
  }, [projects, q, status]);

  const usedPhotos = new Set();

  return (
    <ProDashboardLayout title="Projects" subtitle="Customer posts you quoted and active bookings." wide>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="h-11 w-full max-w-sm rounded-xl border border-[#E7EAF0] px-3 text-sm outline-none focus:border-[#5b46f5] lg:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`${press} rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                status === s ? "bg-[#5b46f5] text-white" : "border border-[#E7EAF0] bg-white text-[#64748b]"
              }`}
            >
              {s}
            </button>
          ))}
          <Link to="/pro/leads" className={`${press} rounded-full bg-[#0B1120] px-4 py-2 text-[12px] font-semibold text-white`}>
            Customer posts
          </Link>
        </div>
      </div>
      {loading && <p className="text-sm text-[#64748b]">Loading projects…</p>}
      {!loading && filtered.length === 0 && (
        <div className="rounded-[24px] border border-[#E7EAF0] bg-white p-10 text-center text-sm text-[#64748b]">
          No projects yet. Customer posts appear in{" "}
          <Link to="/pro/leads" className="font-semibold text-[#5b46f5]">Find Jobs</Link> as soon as they publish.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const img = p.image || photoForItem({ title: p.title, category: p.category }, usedPhotos);
          return (
            <Link
              key={p.id}
              to={p.to}
              className={`${press} overflow-hidden rounded-[24px] border border-[#E7EAF0] bg-white shadow-[0_10px_28px_rgba(15,23,32,0.05)]`}
            >
              <img src={img} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <p className="font-bold text-[#0b1220]">{p.title}</p>
                <p className="mt-1 text-[12px] text-[#64748b]">{p.customer}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div className="h-full rounded-full bg-[#5b46f5]" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="mt-2 text-[12px] font-semibold text-[#5b46f5]">
                  {p.progress}% · {String(p.status).replace(/_/g, " ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </ProDashboardLayout>
  );
}