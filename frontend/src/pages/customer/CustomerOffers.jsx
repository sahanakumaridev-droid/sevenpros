import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";
const money = (n) => `$${Number(n).toFixed(0)}`;

export default function CustomerOffers() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    client
      .get("/credits/posts/mine")
      .then((res) => setPosts(res.data || []))
      .finally(() => setReady(true));
  }, []);

  const offers = useMemo(() => {
    const list = [];
    for (const post of posts) {
      for (const quote of post.quotes || []) {
        list.push({
          ...quote,
          postId: post.id,
          postTitle: post.title,
          city: post.city,
        });
      }
    }
    return list.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return 0;
    });
  }, [posts]);

  const acceptQuote = async (quote) => {
    setNote("");
    setBusyId(quote.id);
    try {
      const res = await client.post(`/credits/bids/${quote.id}/accept`);
      navigate(`/pay?purpose=booking&booking_id=${res.data.booking_id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not accept this offer");
    } finally {
      setBusyId("");
    }
  };

  return (
    <AccountLayout title="Offers Received" subtitle="Review quotes from pros, chat, then accept & pay to start the project.">
      {note && <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-[#9a3412]">{note}</p>}
      {!ready && <p className="text-sm text-[#64748b]">Loading offers…</p>}
      {ready && offers.length === 0 && (
        <div className="rounded-[24px] border border-[#E7EAF0] bg-white p-6 text-sm text-[#64748b]">
          No offers yet.{" "}
          <Link to="/post" className="font-semibold text-[#5b46f5] hover:underline">
            Post a project
          </Link>{" "}
          and pros will send quotes here.
        </div>
      )}

      <ul className="space-y-3">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="flex flex-col gap-4 rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-[#0b1220]">{offer.pro_name || "Pro"}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                    offer.status === "pending" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#64748b]"
                  }`}
                >
                  {offer.status}
                </span>
              </div>
              <p className="mt-1 truncate text-[13px] text-[#64748b]">
                {offer.postTitle}
                {offer.city ? ` · ${offer.city}` : ""}
                {offer.amount != null ? ` · ${money(offer.amount)}` : ""}
              </p>
              {offer.message && <p className="mt-2 line-clamp-2 text-[13px] text-[#475569]">{offer.message}</p>}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to={`/listings/${offer.postId}`}
                className={`${press} inline-flex h-10 items-center rounded-full border border-[#E2E8F0] px-4 text-[13px] font-semibold`}
              >
                View offer
              </Link>
              {offer.status === "pending" && (
                <button
                  type="button"
                  disabled={busyId === offer.id}
                  onClick={() => acceptQuote(offer)}
                  className={`${press} inline-flex h-10 items-center rounded-full bg-[#5b46f5] px-4 text-[13px] font-semibold text-white disabled:opacity-60`}
                >
                  {busyId === offer.id ? "Accepting…" : "Accept & pay"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </AccountLayout>
  );
}
