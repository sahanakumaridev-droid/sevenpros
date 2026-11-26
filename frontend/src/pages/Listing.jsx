import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { photoForItem } from "../lib/photos";
import { directionsUrl } from "../lib/maps";

const press = "transition-transform duration-150 ease-out active:scale-[0.98]";
const money = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

export default function Listing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [missing, setMissing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState("");
  const [offer, setOffer] = useState("");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [activeBid, setActiveBid] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);

  const load = () => {
    client.get(`/credits/listings/${id}`).then((res) => setItem(res.data)).catch(() => setMissing(true));
  };
  useEffect(load, [id]);

  const loadChat = () => {
    client.get(`/credits/messages/${id}`).then((res) => setMessages(res.data)).catch(() => {});
  };

  useEffect(() => {
    if (!showChat) return undefined;
    loadChat();
    client.post(`/credits/inbox/${id}/seen`).catch(() => {});
    const timer = setInterval(loadChat, 5000);
    return () => clearInterval(timer);
  }, [showChat, id]);

  useEffect(() => {
    if (!user) return;
    client.get(`/credits/messages/${id}`).then((res) => {
      setMessages(res.data);
      if (res.data.length) setShowChat(true);
      client.post(`/credits/inbox/${id}/seen`).catch(() => {});
    }).catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (item?.is_owner && item.bids?.length && !showChat) {
      setActiveBid(item.bids[item.bids.length - 1]);
      setShowChat(true);
    }
  }, [item, showChat]);

  const openMember = async () => {
    setNote("");
    try {
      if (user?.is_provider) {
        await client.post("/credits/unlock", { job_id: id });
      } else {
        await client.post("/credits/open", { job_id: id });
      }
      load();
      return true;
    } catch (err) {
      setNote(err.response?.data?.detail || "Sign in to continue");
      return false;
    }
  };

  const startChat = async (bidRow) => {
    if (bidRow) setActiveBid(bidRow);
    if (!item?.is_owner && !item?.opened && !(await openMember())) return;
    setShowChat(true);
    loadChat();
  };

  const call = async (bidRow) => {
    if (item?.is_owner) {
      if (bidRow?.phone) window.location.href = `tel:${bidRow.phone}`;
      else setNote("This pro has no number saved yet. The chat is open.");
      return;
    }
    if (!item?.opened && !(await openMember())) return;
    const next = await client.get(`/credits/listings/${id}`);
    setItem(next.data);
    if (next.data.phone) window.location.href = `tel:${next.data.phone}`;
    else setNote("No phone is saved on this request. Send a chat instead.");
  };

  const send = async (e) => {
    e.preventDefault();
    if (!chat.trim()) return;
    if (!item?.is_owner && !item?.opened && !(await openMember())) return;
    await client.post("/credits/messages", { job_id: id, body: chat.trim() });
    setChat("");
    setShowChat(true);
    loadChat();
  };

  const bid = async (e) => {
    e.preventDefault();
    setNote("");
    try {
      await client.post("/credits/bids", { job_id: id, amount: Number(offer), message: reply.trim() || "I can take this job." });
      setOffer("");
      setReply("");
      setNote("Quote sent. The customer can accept, chat, or call from this request.");
      setShowChat(true);
      load();
      loadChat();
    } catch (err) {
      setNote(err.response?.data?.detail || "Sign in to reply");
    }
  };

  const acceptQuote = async (bidRow) => {
    if (!bidRow?.id) return;
    setAccepting(true);
    setNote("");
    try {
      const res = await client.post(`/credits/bids/${bidRow.id}/accept`);
      navigate(`/pay?purpose=booking&booking_id=${res.data.booking_id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not accept this quote");
    } finally {
      setAccepting(false);
    }
  };

  const requestCallback = async (bidRow) => {
    if (bidRow) setActiveBid(bidRow);
    if (!item?.is_owner && !item?.opened && !(await openMember())) return;
    await client.post("/credits/messages", {
      job_id: id,
      body: item?.is_owner
        ? `Please call me back about your $${bidRow?.amount ?? ""} quote.`
        : "Please call me back about this job.",
    });
    setShowChat(true);
    loadChat();
    setNote("Callback request sent in chat.");
  };

  if (missing) return <div className="container-page py-16 text-[#14181d]">This request is no longer here. Open My posts or post it again.</div>;
  if (!item) return <div className="container-page py-16 text-[#14181d]">Loading…</div>;

  const contact = item.is_owner ? activeBid : null;
  const contactName = contact?.name || (item.is_owner ? "a pro" : item.seller_name);
  const price = contact?.amount ? `$${contact.amount}` : item.needed_by || "Request";
  const place = [item.category, item.city || "California"].filter(Boolean).join(" · ");

  return (
    <div className="min-h-[70vh] bg-[#f6f5fb] text-[#14181d]">
      <div className="container-page grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <ListingMedia item={item} mediaIndex={mediaIndex} setMediaIndex={setMediaIndex} />
          {item.contact_protected && user?.is_provider && (
            <div className="mt-4 rounded-2xl border border-[#E7EAF0] bg-white px-4 py-3 text-sm text-[#334155]">
              <p className="font-semibold text-[#0b1220]">Contact protected</p>
              <p className="mt-1 text-[#64748b]">
                Email {item.email_hint || "hidden"} · Phone {item.phone_hint || "hidden"}
              </p>
              <p className="mt-2 text-[12px] text-[#64748b]">
                {item.free_unlocks_left > 0
                  ? `${item.free_unlocks_left} free lead unlocks left — then buy credits to chat & call.`
                  : "Unlock with credits to chat, call, and see full contact (like Bark)."}
              </p>
              {!item.unlocked && (
                <button type="button" onClick={openMember} className={`${press} mt-3 h-10 rounded-full bg-[#0b1220] px-4 text-sm font-semibold text-white`}>
                  Unlock customer contact
                </button>
              )}
            </div>
          )}
          <p className="mt-5 inline-flex rounded-full bg-[#efe9ff] px-3 py-1 text-[12px] font-semibold text-[#5b46f5]">{place}</p>
          <h1 className="mt-3 text-[40px] font-semibold tracking-[-0.045em]">{item.title}</h1>
          {item.needed_by && <p className="mt-2 text-sm font-semibold text-[#3c4650]">Needed {item.needed_by}</p>}
          {(item.city || item.zip_code) && (
            <a
              href={directionsUrl([item.city, item.zip_code, "California"].filter(Boolean).join(", "))}
              target="_blank"
              rel="noopener noreferrer"
              className={`${press} mt-3 inline-flex h-10 items-center rounded-full border border-[#e6e3f2] px-4 text-sm font-semibold`}
            >
              Get directions to job
            </a>
          )}
          {item.includes_product && <p className="mt-1 text-sm text-[#3c4650]">Includes a product or appliance{item.product_note ? `: ${item.product_note}` : ""}</p>}
          <h2 className="mt-6 text-sm font-semibold text-[#5b46f5]">Description</h2>
          <p className="mt-2 max-w-2xl whitespace-pre-wrap leading-7 text-[#3c4650]">{item.description || "No description yet."}</p>
          {item.is_owner && item.bids?.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.bids.map((bidRow) => (
                <button key={bidRow.id} type="button" onClick={() => startChat(bidRow)} className={`h-9 rounded-full px-3 text-sm font-semibold ${activeBid?.id === bidRow.id ? "bg-[#5b46f5] text-white" : "bg-white text-[#3c4650]"}`}>
                  {bidRow.name} · ${bidRow.amount}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[28px] bg-white p-5 shadow-[0_18px_50px_rgba(70,50,140,0.08)]">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
            <span className="rounded-full bg-[#efe9ff] px-2 py-1.5 text-[#5b46f5]">1. Contact</span>
            <span className="rounded-full bg-[#f6f7f8] px-2 py-1.5 text-[#8b919a]">2. Pro details</span>
            <span className={`rounded-full px-2 py-1.5 ${showChat ? "bg-[#efe9ff] text-[#5b46f5]" : "bg-[#f6f7f8] text-[#8b919a]"}`}>3. Chat or call</span>
          </div>

          <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.03em]">{item.is_owner && !contact ? "Waiting for a pro" : `Contact ${contactName}`}</h2>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#efe9ff] text-sm font-semibold text-[#5b46f5]">
                {(contactName[0] || "S").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.is_owner && !contact ? "Your request is live" : contactName}</p>
                <p className="text-xs text-[#5c6770]">{item.is_owner ? "Reply, then chat or call" : item.seller_name}</p>
              </div>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.04em]">{price}</p>
          </div>

          {(contact || !item.is_owner) && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => startChat(contact)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#5b46f5] text-sm font-semibold text-white ${press}`}>
                Chat
              </button>
              <button type="button" onClick={() => call(contact)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e6e3f2] text-sm font-semibold ${press}`}>
                Call
              </button>
            </div>
          )}

          {item.is_owner && contact?.status === "pending" && (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                disabled={accepting}
                onClick={() => acceptQuote(contact)}
                className={`h-11 w-full rounded-full bg-[#0b1220] text-sm font-semibold text-white ${press} disabled:opacity-60`}
              >
                {accepting ? "Accepting…" : `Accept quote · ${money(contact.total_due_cents || contact.amount * 100)}`}
              </button>
              <p className="text-center text-[11px] text-[#64748b]">
                Includes ${Number(contact.amount).toFixed(2)} quote + {money(contact.service_fee_cents || 0)} platform fee
              </p>
            </div>
          )}
          {item.is_owner && contact?.status === "accepted" && contact?.booking_id && (
            <Link
              to={`/pay?purpose=booking&booking_id=${contact.booking_id}`}
              className={`mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#00a878] text-sm font-semibold text-white ${press}`}
            >
              Pay to confirm booking
            </Link>
          )}
          {(contact || !item.is_owner) && (
            <button type="button" onClick={() => requestCallback(contact)} className={`mt-2 h-10 w-full rounded-full border border-[#e6e3f2] text-sm font-semibold ${press}`}>
              Request callback
            </button>
          )}

          {!item.is_owner && user?.is_provider && !item.unlocked && (
            <p className="mt-3 rounded-xl bg-[#FEF9C3] px-3 py-2 text-[12px] text-[#713f12]">
              You can send a free quote below. Ongoing chat and calls need an unlock (3 free leads, then credits).
            </p>
          )}
          {!item.is_owner && user && (
            <form onSubmit={bid} className="mt-4 space-y-2">
              <input value={offer} onChange={(e) => setOffer(e.target.value)} inputMode="decimal" required placeholder="Your price" className="h-11 w-full rounded-xl border border-[#e6e8ef] px-3 text-[15px] outline-none focus:border-[#5b46f5]" />
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="When you can come, and what is included" className="h-20 w-full rounded-xl border border-[#e6e8ef] px-3 py-2 text-[15px] outline-none focus:border-[#5b46f5]" />
              <button type="submit" className={`h-11 w-full rounded-full bg-[#14181d] text-sm font-semibold text-white ${press}`}>Send reply</button>
            </form>
          )}
          {!user && <Link to={`/login?next=/listings/${id}`} className="mt-4 inline-block text-sm font-semibold text-[#5b46f5]">Sign in to reply</Link>}

          <div className="mt-5">
            <p className="text-sm font-semibold text-[#3c4650]">Or send a message</p>
            {showChat && (
              <div className="mt-3 max-h-52 space-y-2 overflow-auto">
                {messages.length === 0 && <p className="text-sm text-[#8b919a]">No messages yet.</p>}
                {messages.map((row) => (
                  <div key={row.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${row.mine ? "ml-auto bg-[#5b46f5] text-white" : "bg-[#f4f2fa] text-[#14181d]"}`}>
                    {!row.mine && <p className="mb-0.5 text-[11px] font-semibold text-[#5b46f5]">{row.name}</p>}
                    {row.body}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={send} className="mt-3 flex gap-2">
              <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Write a message..." className="h-12 min-w-0 flex-1 rounded-full border border-[#e6e8ef] bg-[#f7f8fb] px-4 text-sm outline-none focus:border-[#5b46f5]" />
              <button aria-label="Send message" className={`grid size-12 place-items-center rounded-full bg-[#5b46f5] text-white ${press}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
          </div>

          <div className="mt-4 flex gap-3 rounded-2xl bg-[#f6f4ff] px-3 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#5b46f5]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.8 3 4v3.2c0 3 2.1 5.2 5 6 2.9-.8 5-3 5-6V4L8 1.8Z" stroke="currentColor" strokeWidth="1.4" /></svg>
            </span>
            <p className="text-sm"><span className="font-semibold">Safe and secure.</span> <span className="text-[#5c6770]">Chat stays on this request. Call uses the number saved on the account.</span></p>
          </div>
          {note && <p className="mt-3 text-sm text-[#3c4650]">{note}</p>}
        </aside>
      </div>
    </div>
  );
}

function ListingMedia({ item, mediaIndex, setMediaIndex }) {
  const images = item.images?.length ? item.images : item.image ? [item.image] : [];
  const hero = images[mediaIndex] || item.image || photoForItem(item);
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#e8eaed]">
      {item.video ? (
        <video src={item.video} controls playsInline className="h-72 w-full bg-black object-contain sm:h-[420px]" />
      ) : (
        <img src={hero} alt="" width="640" height="360" fetchPriority="high" decoding="async" className="h-72 w-full object-cover object-top sm:h-[420px]" />
      )}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-white/90 p-2">
          {images.map((src, idx) => (
            <button key={idx} type="button" onClick={() => setMediaIndex(idx)}>
              <img src={src} alt="" className={`h-14 w-14 rounded-lg object-cover ring-2 ${mediaIndex === idx ? "ring-[#5b46f5]" : "ring-transparent"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
