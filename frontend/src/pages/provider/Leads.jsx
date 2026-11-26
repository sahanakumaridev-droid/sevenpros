import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { placeLabel, placeParams, readPlace } from "../../lib/coverage";
import { photoForItem } from "../../lib/photos";
import { press } from "./ProUi";

const field =
  "h-11 rounded-xl border border-[#E7EAF0] bg-white px-3 text-[14px] text-[#0b1220] outline-none focus:border-[#5b46f5]";

function BidBox({ jobId, onDone, onError }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post("/credits/bids", { job_id: jobId, amount: Number(amount), message });
      setSent(true);
      onDone();
    } catch (err) {
      onError(err.response?.data?.detail || "Could not send the quote");
    } finally {
      setBusy(false);
    }
  };

  if (sent) return <p className="mt-3 text-sm font-semibold text-[#15803D]">Quote sent to customer.</p>;

  return (
    <form onSubmit={send} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        placeholder="Your message to the customer"
        className={`${field} flex-1`}
      />
      <input
        type="number"
        min="0"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Quote $"
        required
        className={`${field} sm:w-28`}
      />
      <button type="submit" disabled={busy} className={`${press} h-11 rounded-xl bg-[#5b46f5] px-4 text-sm font-semibold text-white`}>
        {busy ? "Sending…" : "Send offer"}
      </button>
    </form>
  );
}

export default function Leads() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [place, setPlace] = useState(readPlace);

  const load = () => {
    client
      .get("/credits/leads", { params: { ...placeParams(readPlace()), wide: true } })
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Could not load customer posts");
      });
  };

  useEffect(() => {
    load();
    const onPlace = () => {
      setPlace(readPlace());
      load();
    };
    window.addEventListener("sevenpros-place", onPlace);
    const timer = setInterval(load, 25000);
    return () => {
      window.removeEventListener("sevenpros-place", onPlace);
      clearInterval(timer);
    };
  }, []);

  const unlock = async (jobId) => {
    setBusy(jobId);
    setError("");
    try {
      await client.post("/credits/unlock", { job_id: jobId });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Unlock failed");
    } finally {
      setBusy("");
    }
  };

  const usedPhotos = new Set();

  return (
    <ProDashboardLayout title="Find Jobs" subtitle="Customer project posts from SevenPros — quote to connect." wide>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[#64748b]">
          {data ? `${data.leads.length} open posts · ${placeLabel(place)} · ${data.balance ?? 0} credits` : "Loading…"}
        </p>
        <Link to="/pro/subscription" className="text-sm font-semibold text-[#5b46f5] hover:underline">
          Credits & plan
        </Link>
      </div>
      {error && <p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#9a3412]">{error}</p>}
      <div className="space-y-4">
        {data?.leads?.length === 0 && (
          <p className="rounded-[24px] border border-[#E7EAF0] bg-white p-8 text-center text-sm text-[#64748b]">
            No customer posts yet. When a customer uses Post a Project, it appears here automatically.
          </p>
        )}
        {data?.leads?.map((lead) => {
          const img = lead.image || photoForItem(lead, usedPhotos);
          return (
            <article key={lead.id} className="overflow-hidden rounded-[24px] border border-[#E7EAF0] bg-white shadow-[0_8px_24px_rgba(15,23,32,0.04)]">
              <div className="grid md:grid-cols-[200px_1fr]">
                <img src={img} alt="" className="h-40 w-full object-cover md:h-full md:min-h-[180px]" />
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b46f5]">{lead.category}</p>
                  <h2 className="mt-1 text-lg font-bold text-[#0b1220]">{lead.title}</h2>
                  <p className="mt-2 text-sm text-[#64748b]">{lead.description}</p>
                  <p className="mt-2 text-[13px] text-[#64748b]">
                    {lead.customer_name} · {[lead.city, lead.zip_code].filter(Boolean).join(" ")}
                    {lead.needed_by ? ` · Needed ${lead.needed_by}` : ""}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-[#94A3B8]">
                    {lead.bid_count ?? 0} offers · {lead.slots_left} slots left
                  </p>
                  {lead.customer_message && (
                    <p className="mt-3 rounded-xl bg-[#F5F3FF] px-3 py-2 text-sm text-[#334155]">
                      <span className="font-semibold text-[#5b46f5]">{lead.customer_message_from}: </span>
                      {lead.customer_message}
                    </p>
                  )}
                  <BidBox jobId={lead.id} onDone={load} onError={setError} />
                  <Link to={`/listings/${lead.id}`} className="mt-3 inline-flex text-sm font-semibold text-[#5b46f5]">
                    Open thread →
                  </Link>
                  {lead.unlocked ? (
                    <div className="mt-3 text-sm text-[#334155]">
                      <p>{lead.phone || "No phone"}</p>
                      <p>{lead.email || "No email"}</p>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F7] pt-3">
                      <div className="text-[13px] text-[#64748b]">
                        <p className="font-semibold text-[#334155]">Contact protected (Bark-style)</p>
                        <p className="mt-0.5">
                          {lead.phone_hint || "(***) ***-****"} · {lead.email_hint || "hidden@email.com"}
                        </p>
                        <p className="mt-1">{lead.slots_left} of 3 pro slots · quote free, chat after unlock</p>
                      </div>
                      <button
                        type="button"
                        disabled={busy === lead.id || lead.slots_left === 0}
                        onClick={() => unlock(lead.id)}
                        className={`${press} h-10 rounded-xl bg-[#0B1120] px-4 text-sm font-semibold text-white disabled:opacity-40`}
                      >
                        {lead.slots_left === 0 ? "Full" : `Unlock · ${data.lead_cost}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </ProDashboardLayout>
  );
}