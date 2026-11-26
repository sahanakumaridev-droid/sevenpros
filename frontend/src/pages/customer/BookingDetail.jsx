import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AccountLayout from "../../components/AccountLayout";
import { directionsUrl } from "../../lib/maps";

const STATUS = {
  pending: { label: "Pending", className: "bg-[#FFF6E5] text-[#B45309]" },
  accepted: { label: "Accepted", className: "bg-[#DBEAFE] text-[#1D4ED8]" },
  in_progress: { label: "In progress", className: "bg-[#EEE8FF] text-[#6D28D9]" },
  completed: { label: "Completed", className: "bg-[#E9F9F1] text-[#047857]" },
  cancelled: { label: "Cancelled", className: "bg-[#F1F5F9] text-[#64748b]" },
  rejected: { label: "Declined", className: "bg-[#FDECEC] text-[#B91C1C]" },
};

export default function BookingDetail() {
  const { user } = useAuth();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const load = () => {
    client
      .get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .catch(() => setError("This booking could not be opened."));
  };

  useEffect(load, [bookingId]);

  const cancelBooking = async () => {
    await client.patch(`/bookings/${bookingId}/status`, { status: "cancelled" });
    setConfirmCancel(false);
    load();
  };

  const submitReview = async () => {
    await client.post("/reviews", { booking_id: bookingId, ...reviewForm });
    setReviewOpen(false);
    load();
  };

  if (error) {
    return (
      <AccountLayout title="Booking" subtitle="This job is not available.">
        <Link to="/account/bookings" className="text-sm font-semibold text-blue">
          ← Back to bookings
        </Link>
      </AccountLayout>
    );
  }

  if (!booking) {
    return (
      <AccountLayout title="Booking" subtitle="Loading this job.">
        <div className="rounded-2xl border border-line bg-raised p-6">
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-4 w-1/2 mt-4" />
        </div>
      </AccountLayout>
    );
  }

  const meta = STATUS[booking.status] || STATUS.pending;
  const price = booking.final_price ?? booking.quoted_price;
  const serviceId = booking.service?.id;

  const rows = [
    ["Scheduled", `${booking.scheduled_date} · ${booking.scheduled_time}`],
    ["Address", booking.address_line],
    ["Service", booking.service.category?.name || booking.service.title],
    ["Payment", `${booking.payment_status}${price != null ? ` · $${Number(price).toFixed(2)}` : ""}`],
    ["Booked", new Date(booking.created_at).toLocaleString()],
  ];

  return (
    <AccountLayout title={booking.service.title} subtitle="Job details for this booking.">
      <Link to="/account/bookings" className="text-sm font-semibold text-blue">
        ← All bookings
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>{meta.label}</span>
        {booking.is_emergency && <span className="text-sm font-semibold text-[#B45309]">Emergency</span>}
      </div>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <section>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-4">
                <dt className="text-sm text-slate">{label}</dt>
                <dd className="text-sm font-semibold text-ink capitalize">{value}</dd>
              </div>
            ))}
            {booking.notes && (
              <div className="grid grid-cols-[120px_1fr] gap-4 py-4">
                <dt className="text-sm text-slate">Notes</dt>
                <dd className="text-sm text-ink">{booking.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {booking.address_line && (
              <a
                href={directionsUrl(booking.address_line)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-xl border border-[#E7EAF0] bg-white px-5 text-sm font-semibold text-[#334155]"
              >
                Get directions
              </a>
            )}
            {booking.job_id && (
              <Link
                to={user?.is_provider ? `/pro/messages?job=${booking.job_id}` : `/account/messages?job=${booking.job_id}`}
                className="inline-flex h-11 items-center rounded-xl bg-[#5b46f5] px-5 text-sm font-semibold text-white"
              >
                Open job chat
              </Link>
            )}
            {booking.payment_status !== "paid" && booking.status !== "cancelled" && (
              <Link
                to={`/pay?purpose=booking&booking_id=${booking.id}`}
                className="inline-flex h-11 items-center rounded-xl bg-[#5b46f5] px-5 text-sm font-semibold text-white"
              >
                Pay quote + fee
              </Link>
            )}
            {serviceId && (
              <Link to={`/book/${booking.provider_id}/${serviceId}`} className="h-11 px-5 rounded-xl bg-brand-grad text-white text-sm font-semibold inline-flex items-center">
                Book this service again
              </Link>
            )}
            {["pending", "accepted"].includes(booking.status) && (
              <button type="button" onClick={() => setConfirmCancel(true)} className="h-11 px-4 text-sm font-semibold text-[#B91C1C]">
                Cancel booking
              </button>
            )}
            {booking.status === "completed" && (
              <button type="button" onClick={() => setReviewOpen(true)} className="h-11 px-4 text-sm font-semibold text-blue">
                Leave a review
              </button>
            )}
          </div>

          {confirmCancel && (
            <div className="mt-4 rounded-xl bg-[#FDECEC] p-4 max-w-md">
              <p className="text-sm font-semibold">Cancel this booking?</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={cancelBooking} className="h-9 px-4 rounded-lg bg-[#B91C1C] text-white text-sm font-semibold">
                  Yes, cancel
                </button>
                <button type="button" onClick={() => setConfirmCancel(false)} className="h-9 px-4 text-sm font-semibold">
                  Keep it
                </button>
              </div>
            </div>
          )}

          {reviewOpen && (
            <div className="mt-4 max-w-md space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className={`text-2xl leading-none ${n <= reviewForm.rating ? "text-[#F5B400]" : "text-[#D7E3F0]"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="How was your experience?"
                className="w-full rounded-xl border border-[#E7EAF0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0b1220] placeholder:text-[#64748b]"
                rows={3}
              />
              <button type="button" onClick={submitReview} className="btn btn-primary h-9 px-4 text-sm rounded-xl">
                Submit review
              </button>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 rounded-2xl border border-line bg-raised p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">Your pro</p>
          <p className="mt-2 text-lg font-bold leading-snug">{booking.provider.business_name}</p>
          <p className="mt-1 text-sm text-slate">
            {[booking.provider.city, booking.provider.state].filter(Boolean).join(", ")}
          </p>
          {booking.provider.tagline && <p className="mt-3 text-sm text-ink">{booking.provider.tagline}</p>}
          <Link
            to={`/providers/${booking.provider_id}`}
            className="mt-4 h-10 px-4 rounded-xl border border-line text-sm font-semibold inline-flex items-center"
          >
            Open profile
          </Link>
        </aside>
      </div>
    </AccountLayout>
  );
}
