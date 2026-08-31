import { useEffect, useState } from "react";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";

const STATUS_COLORS = {
  pending: "bg-overlay text-warn",
  accepted: "bg-brand-50 text-brand-400",
  in_progress: "bg-overlay text-focus",
  completed: "bg-brand-50 text-brand-400",
  cancelled: "bg-overlay text-muted",
  rejected: "bg-[#2a1c14] text-danger",
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
    client.get("/bookings/provider").then((res) => {
      setBookings(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const setStatus = async (id, status) => {
    await client.patch(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <ProDashboardLayout title="Bookings">
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No booking requests yet.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="border border-gray-200 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{b.customer.full_name}</div>
                  <div className="text-sm text-gray-600">{b.service.title}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {b.scheduled_date} at {b.scheduled_time} &middot; {b.address_line}
                  </div>
                  {b.notes && <div className="text-sm text-gray-500 mt-1">Note: {b.notes}</div>}
                  {b.is_emergency && (
                    <span className="inline-block mt-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                      Emergency
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[b.status]}`}>
                  {b.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Quoted: <span className="font-medium">${b.quoted_price?.toFixed(2) ?? "—"}</span>
                  {" · "}Payment: <span className="font-medium capitalize">{b.payment_status}</span>
                </div>
                <div className="flex gap-2">
                  {(NEXT_ACTIONS[b.status] || []).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => setStatus(b.id, status)}
                      className="text-sm font-medium border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
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
