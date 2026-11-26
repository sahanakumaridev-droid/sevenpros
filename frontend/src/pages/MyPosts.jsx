import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import AccountLayout from "../components/AccountLayout";

const money = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [note, setNote] = useState("");

  const load = () => {
    client
      .get("/credits/posts/mine")
      .then((res) => setPosts(res.data || []))
      .finally(() => setReady(true));
  };

  useEffect(load, []);

  const acceptQuote = async (quote) => {
    setNote("");
    setBusyId(quote.id);
    try {
      const res = await client.post(`/credits/bids/${quote.id}/accept`);
      navigate(`/pay?purpose=booking&booking_id=${res.data.booking_id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not accept this quote");
    } finally {
      setBusyId("");
    }
  };

  return (
    <AccountLayout title="My Posts" subtitle="Accept a quote to create a booking, then pay the quote + platform fee.">
      <div>
        <div className="mb-5 flex justify-end">
          <Link to="/post" className="inline-flex h-11 items-center rounded-full bg-[#0B1120] px-4 text-sm font-semibold text-white">
            New post
          </Link>
        </div>

        {note && <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-[#9a3412]">{note}</p>}
        {!ready && <p className="mt-8 text-sm text-[#5c6770]">Loading your posts…</p>}
        {ready && posts.length === 0 && (
          <p className="mt-8 rounded-2xl bg-white p-6 text-sm text-[#3c4650]">
            Nothing posted yet. Post a job and pros will send quotes here.
          </p>
        )}

        <ul className="mt-6 space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(15,23,32,0.05)]">
              <Link to={`/listings/${post.id}`} className="flex items-center justify-between gap-4 border-b border-[#eceff2] px-5 py-4 hover:bg-[#f7faf9]">
                <span>
                  <span className="block font-semibold">{post.title}</span>
                  <span className="text-sm text-[#5c6770]">
                    {[post.city, post.category].filter(Boolean).join(" · ") || "Request"}
                    {post.pending_quotes ? ` · ${post.pending_quotes} new quote${post.pending_quotes === 1 ? "" : "s"}` : ""}
                  </span>
                </span>
                <span className="text-sm font-semibold text-[#5b46f5]">Open →</span>
              </Link>

              {post.quotes?.length > 0 ? (
                <ul className="divide-y divide-[#f0f2f5]">
                  {post.quotes.map((quote) => (
                    <li key={quote.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {quote.pro_name} · ${Number(quote.amount).toFixed(2)}
                        </p>
                        <p className="mt-0.5 text-sm text-[#5c6770] line-clamp-2">{quote.message || "No message"}</p>
                        <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.06em] text-[#64748b]">
                          {quote.status}
                          {quote.status === "pending" ? ` · total due ${money(quote.total_due_cents)} (incl. fee)` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          to={`/listings/${post.id}`}
                          className="inline-flex h-10 items-center rounded-full border border-[#e6e8eb] px-4 text-sm font-semibold"
                        >
                          Chat
                        </Link>
                        {quote.status === "pending" && (
                          <button
                            type="button"
                            disabled={busyId === quote.id}
                            onClick={() => acceptQuote(quote)}
                            className="inline-flex h-10 items-center rounded-full bg-[#0b1220] px-4 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {busyId === quote.id ? "Accepting…" : "Accept & pay"}
                          </button>
                        )}
                        {quote.status === "accepted" && quote.booking_id && (
                          <Link
                            to={`/pay?purpose=booking&booking_id=${quote.booking_id}`}
                            className="inline-flex h-10 items-center rounded-full bg-[#00a878] px-4 text-sm font-semibold text-white"
                          >
                            Pay booking
                          </Link>
                        )}
                        {quote.status === "accepted" && quote.booking_id && (
                          <Link
                            to={`/account/bookings/${quote.booking_id}`}
                            className="inline-flex h-10 items-center rounded-full border border-[#e6e8eb] px-4 text-sm font-semibold"
                          >
                            Booking
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-[#8b919a]">Waiting for pro quotes…</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AccountLayout>
  );
}
