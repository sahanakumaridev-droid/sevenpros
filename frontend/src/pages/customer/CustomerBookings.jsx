import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS = {
  pending: { label: "Pending", className: "bg-[#FFF6E5] text-[#B45309]" },
  accepted: { label: "Accepted", className: "bg-[#E8F7FE] text-[#0369A1]" },
  in_progress: { label: "In progress", className: "bg-[#EEE8FF] text-[#6D28D9]" },
  completed: { label: "Completed", className: "bg-[#E9F9F1] text-[#047857]" },
  cancelled: { label: "Cancelled", className: "bg-[#F4F7FB] text-slate" },
  rejected: { label: "Declined", className: "bg-[#FDECEC] text-[#B91C1C]" },
};

function isUpcoming(status) {
  return ["pending", "accepted", "in_progress"].includes(status);
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [cancelId, setCancelId] = useState(null);

  const load = () => {
    client.get("/bookings/mine").then((res) => {
      setBookings(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      upcoming: bookings.filter((b) => isUpcoming(b.status)).length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length,
    }),
    [bookings],
  );

  const visible = bookings.filter((b) => {
    if (filter === "upcoming") return isUpcoming(b.status);
    if (filter === "completed") return b.status === "completed";
    if (filter === "cancelled") return b.status === "cancelled" || b.status === "rejected";
    return true;
  });

  const cancelBooking = async (id) => {
    await client.patch(`/bookings/${id}/status`, { status: "cancelled" });
    setCancelId(null);
    load();
  };

  const submitReview = async (bookingId) => {
    await client.post("/reviews", { booking_id: bookingId, ...reviewForm });
    setReviewingId(null);
    setReviewForm({ rating: 5, comment: "" });
    load();
  };

  return (
    <AccountLayout title="My Bookings" subtitle="Track jobs, payments, and reviews in one place.">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`pressable shrink-0 h-9 rounded-full px-3.5 text-sm font-semibold ${
              filter === f.id ? "bg-navy text-white" : "bg-white border border-[#E6EEF7] text-navy/70"
            }`}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E6EEF7] bg-white p-5">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-1/2 mt-3" />
              <div className="skeleton h-10 w-full mt-5" />
            </div>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="mt-5 rounded-2xl border border-[#E6EEF7] bg-white px-6 py-16 text-center">
          <p className="font-bold text-lg">No bookings here yet</p>
          <p className="mt-1 text-slate">Find a verified pro and schedule your next job.</p>
          <Link to="/search" className="btn btn-primary inline-flex mt-5 h-11 px-5 rounded-xl">
            Find a Pro
          </Link>
        </div>
      )}

      {!loading && (
        <div className="mt-5 space-y-4">
          {visible.map((b) => {
            const meta = STATUS[b.status] || STATUS.pending;
            const price = b.final_price ?? b.quoted_price;
            const serviceId = b.service?.id;
            return (
              <article key={b.id} className="rounded-2xl border border-[#E6EEF7] bg-white p-5 shadow-[0_8px_24px_rgba(7,26,58,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="size-14 rounded-2xl bg-[#EEF4FB] text-navy font-bold grid place-items-center shrink-0">
                    {b.provider.business_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link to={`/providers/${b.provider_id}`} className="font-bold text-[15px] hover:text-blue">
                          {b.provider.business_name}
                        </Link>
                        <p className="text-sm text-slate mt-0.5">{b.service.title}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate font-semibold">When</dt>
                        <dd className="mt-0.5 font-medium tabular-nums">
                          {b.scheduled_date} · {b.scheduled_time}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate font-semibold">Where</dt>
                        <dd className="mt-0.5 font-medium truncate">{b.address_line}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate font-semibold">Payment</dt>
                        <dd className="mt-0.5 font-medium capitalize">
                          {b.payment_status}
                          {price != null && <span className="tabular-nums"> · ${Number(price).toFixed(2)}</span>}
                        </dd>
                      </div>
                    </dl>

                    {b.is_emergency && (
                      <p className="mt-2 text-[12px] font-semibold text-[#B45309]">Emergency request</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/providers/${b.provider_id}`}
                        className="h-10 px-4 rounded-xl border border-[#D7E3F0] text-sm font-semibold inline-flex items-center hover:bg-[#F5F8FC]"
                      >
                        View Pro
                      </Link>
                      {serviceId && (
                        <Link
                          to={`/book/${b.provider_id}/${serviceId}`}
                          className="h-10 px-4 rounded-xl bg-brand-grad text-white text-sm font-semibold inline-flex items-center"
                        >
                          Book again
                        </Link>
                      )}
                      {["pending", "accepted"].includes(b.status) && (
                        <button
                          type="button"
                          onClick={() => setCancelId(b.id)}
                          className="h-10 px-4 rounded-xl text-sm font-semibold text-[#B91C1C] hover:bg-[#FDECEC]"
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === "completed" && reviewingId !== b.id && (
                        <button
                          type="button"
                          onClick={() => setReviewingId(b.id)}
                          className="h-10 px-4 rounded-xl text-sm font-semibold text-blue hover:bg-[#E8F7FE]"
                        >
                          Leave a review
                        </button>
                      )}
                    </div>

                    {cancelId === b.id && (
                      <div className="mt-4 rounded-xl bg-[#FDECEC] p-4">
                        <p className="text-sm font-semibold">Cancel this booking?</p>
                        <p className="text-sm text-slate mt-1">The pro will be notified. You can book again anytime.</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => cancelBooking(b.id)}
                            className="h-9 px-4 rounded-lg bg-[#B91C1C] text-white text-sm font-semibold"
                          >
                            Yes, cancel
                          </button>
                          <button type="button" onClick={() => setCancelId(null)} className="h-9 px-4 text-sm font-semibold">
                            Keep booking
                          </button>
                        </div>
                      </div>
                    )}

                    {reviewingId === b.id && (
                      <div className="mt-4 rounded-xl bg-[#F4F7FB] p-4 space-y-3">
                        <p className="text-sm font-semibold">How was {b.provider.business_name}?</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                              className={`text-2xl leading-none ${n <= reviewForm.rating ? "text-[#F5B400]" : "text-[#D7E3F0]"}`}
                              aria-label={`${n} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                          placeholder="How was your experience?"
                          className="w-full !bg-white !text-navy !border !border-[#D7E3F0] rounded-xl px-3 py-2 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => submitReview(b.id)} className="btn btn-primary h-9 px-4 text-sm rounded-xl">
                            Submit review
                          </button>
                          <button type="button" onClick={() => setReviewingId(null)} className="text-sm font-semibold text-slate">
                            Not now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
