import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { press } from "./ProUi";
import { directionsUrl } from "../../lib/maps";

const STATUS_COLORS = {
  pending: "bg-[#FFEDD5] text-[#9a3412]",
  accepted: "bg-[#DBEAFE] text-[#1D4ED8]",
  in_progress: "bg-[#EDE9FE] text-[#5b46f5]",
  completed: "bg-[#DCFCE7] text-[#15803D]",
  cancelled: "bg-[#F1F5F9] text-[#64748b]",
  rejected: "bg-[#FEE2E2] text-[#9a3412]",
};

const NEXT_ACTIONS = {
  pending: [
    ["accepted", "Accept"],
    ["rejected", "Decline"],
  ],
  accepted: [["in_progress", "Start Job"]],
  in_progress: [["completed", "Mark Completed"]],
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    client
      .get("/bookings/provider")
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id, status) => {
    await client.patch(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <ProDashboardLayout title="My Jobs" subtitle="Bookings created when customers accept your quotes." wide>
      {loading ? (
        <div className="text-sm text-[#64748b]">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-[24px] border border-[#E7EAF0] bg-white p-10 text-center text-sm text-[#64748b]">
          No bookings yet. Send offers on{" "}
          <Link to="/pro/leads" className="font-semibold text-[#5b46f5]">
            customer posts
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#0b1220]">{b.customer?.full_name}</div>
                  <div className="mt-1 text-sm font-semibold text-[#334155]">{b.service?.title}</div>
                  <div className="mt-1 text-sm text-[#64748b]">
                    {b.scheduled_date} at {b.scheduled_time} · {b.address_line}
                  </div>
                  {b.notes && <p className="mt-2 text-sm text-[#64748b]">Note: {b.notes}</p>}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}
                >
                  {b.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F7] pt-4">
                <div className="text-sm text-[#334155]">
                  Quoted <span className="font-bold">${b.quoted_price?.toFixed(2) ?? "—"}</span>
                  {" · "}
                  Payment <span className="font-semibold capitalize">{b.payment_status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.address_line && (
                    <a
                      href={directionsUrl(b.address_line)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${press} rounded-xl bg-[#0b1220] px-3 py-1.5 text-sm font-semibold text-white`}
                    >
                      Navigate to job
                    </a>
                  )}
                  {b.job_id && (
                    <Link to={`/pro/messages?job=${b.job_id}`} className={`${press} rounded-xl border border-[#5b46f5] px-3 py-1.5 text-sm font-semibold text-[#5b46f5]`}>
                      Chat
                    </Link>
                  )}
                  {(NEXT_ACTIONS[b.status] || []).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(b.id, status)}
                      className={`${press} rounded-xl border border-[#E7EAF0] bg-white px-3 py-1.5 text-sm font-semibold text-[#334155] hover:border-[#5b46f5]`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProDashboardLayout>
  );
}