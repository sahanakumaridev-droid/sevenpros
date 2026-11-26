import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const PHOTOS = {
  plumbing: "/categories/plumbing.jpg?v=2",
  electrical: "/categories/electrical.jpg?v=2",
  hvac: "/categories/hvac.jpg?v=2",
  cleaning: "/categories/cleaning.jpg?v=2",
  painting: "/categories/painting.jpg?v=2",
  landscaping: "/categories/landscaping.jpg?v=2",
  handyman: "/categories/handyman.jpg?v=2",
  appliance: "/categories/appliance-repair.jpg?v=2",
};

function photoFor(service) {
  const text = `${service?.title || ""} ${service?.category?.name || ""}`.toLowerCase();
  const key = Object.keys(PHOTOS).find((name) => text.includes(name));
  return PHOTOS[key] || "/categories/handyman.jpg?v=2";
}

export default function Booking() {
  const { providerId, serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [offer, setOffer] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    client.get(`/providers/${providerId}`).then((res) => {
      setProvider(res.data);
      const found = res.data.services.find((item) => item.id === serviceId) || res.data.services[0];
      setService(found);
      if (found?.price_min) setOffer(String(found.price_min));
    });
  }, [providerId, serviceId]);

  const loadContact = () => {
    client.get(`/credits/member/${providerId}`).then((res) => setContact(res.data)).catch(() => {});
  };
  useEffect(loadContact, [providerId, user]);

  const openContact = async () => {
    if (!user) {
      navigate(`/login?next=/book/${providerId}/${serviceId}`);
      return null;
    }
    if (contact?.opened) return contact;
    const res = await client.post(`/credits/member/${providerId}/open`);
    setContact(res.data);
    return res.data;
  };

  const startChat = async () => {
    setNote("");
    try {
      const next = await openContact();
      if (!next) return;
      setShowChat(true);
      const thread = encodeURIComponent(next.thread);
      const rows = await client.get(`/credits/messages/${thread}`);
      setMessages(rows.data);
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not open chat");
    }
  };

  const call = async () => {
    setNote("");
    try {
      const next = await openContact();
      if (next?.phone) window.location.href = `tel:${next.phone}`;
      else setNote("No phone on this account");
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not open the number");
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chat.trim() || !contact?.thread) return;
    await client.post("/credits/messages", { job_id: contact.thread, body: chat.trim() });
    setChat("");
    const rows = await client.get(`/credits/messages/${encodeURIComponent(contact.thread)}`);
    setMessages(rows.data);
  };

  const bookNow = async () => {
    if (!user) {
      navigate(`/login?next=/book/${providerId}/${serviceId}`);
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const today = new Date();
      const date = today.toISOString().slice(0, 10);
      const res = await client.post("/bookings", {
        provider_id: providerId,
        service_id: service.id,
        scheduled_date: date,
        scheduled_time: "10:00",
        address_line: provider.city ? `${provider.city}, CA` : "Address TBD",
        notes: `Booked from service page. Customer offer reference: $${Number(offer) || service.price_min || 0}`,
        is_emergency: false,
      });
      navigate(`/pay?purpose=booking&booking_id=${res.data.id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Could not create booking");
    } finally {
      setBusy(false);
    }
  };

  const sendOffer = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=/book/${providerId}/${serviceId}`);
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const res = await client.post("/credits/posts", {
        title: service.title,
        description: `Offer for ${provider.business_name}. ${service.description || ""}`.trim(),
        category: service.category?.name || service.title,
        city: provider.city || "",
        zip_code: "",
        kind: "request",
        price: Number(offer) || service.price_min || 0,
      });
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Sign in to send an offer");
    } finally {
      setBusy(false);
    }
  };

  if (!provider || !service) {
    return <div className="container-page py-16 text-sm text-[#5c6770]">Loading listing…</div>;
  }

  const price = service.price_type === "quote" ? "Make an offer" : `$${service.price_min}${service.price_max ? ` – $${service.price_max}` : ""}`;
  const photos = [photoFor(service)];
  if (provider.cover_image_url && !photos.includes(provider.cover_image_url)) {
    photos.push(provider.cover_image_url);
  }
  const stages = ["Service", "Detail", "Result"];
  const current = photos[photoIndex] || photos[0];
  const shift = (step) => setPhotoIndex((index) => (index + step + photos.length) % photos.length);

  return (
    <div className="bg-[#f7f8fb] text-[#14181d]">
      <div className="container-page grid items-start gap-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-[#e8edf2]">
            <img src={current} alt="" className="aspect-[16/10] w-full object-cover object-top" />
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold">{stages[photoIndex % stages.length]}</span>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">{photoIndex + 1}/{photos.length}</span>
            <button type="button" onClick={() => shift(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-lg shadow">‹</button>
            <button type="button" onClick={() => shift(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-lg shadow">›</button>
            <button type="button" onClick={() => setLightbox(true)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white text-sm shadow" aria-label="Open photos">⤢</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {photos.map((src, index) => (
              <button key={src} type="button" onClick={() => setPhotoIndex(index)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ${index === photoIndex ? "ring-2 ring-[#2563eb]" : ""}`}>
                <img src={src} alt="" className="h-full w-full object-cover object-top" />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] font-bold text-white">{stages[index % stages.length]}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setLightbox(true)} className="mt-3 text-sm font-bold text-[#2563eb]">View all photos · {photos.length} items</button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">{price}</p>
          <h1 className="mt-3 text-[26px] font-bold leading-snug">{service.title}</h1>
          <p className="mt-2 text-[15px] font-medium">{[provider.city, "California"].filter(Boolean).join(", ")}</p>
          <p className="mt-3 text-[15px] leading-6">{service.description || `${provider.business_name} offers this service.`}</p>

          <Link to={`/providers/${provider.id}`} className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e7eaf0] bg-[#f8fafc] p-3">
            <span className="grid size-12 place-items-center rounded-full bg-[#14181d] text-lg font-bold text-white">{provider.business_name?.[0] || "P"}</span>
            <span>
              <span className="block font-bold">{provider.business_name}</span>
              <span className="text-sm text-[#5c6770]">Seller</span>
            </span>
          </Link>
          <p className="mt-4 text-[15px] font-semibold">Phone {contact?.opened ? contact.phone || "not on file" : contact?.phone_hint || "not on file"}</p>
          <p className="text-[15px] font-semibold">Email {contact?.opened ? contact.email || "not on file" : contact?.email_hint || "not on file"}</p>
          <p className="mt-1 text-sm text-[#5c6770]">
            {contact?.opened
              ? "Full contact unlocked for this pro."
              : contact?.free_contacts_left > 0
                ? `${contact.free_contacts_left} of 3 free contacts left — chat or call unlocks this pro at no credit cost.`
                : contact?.next_contact_cost
                  ? `After your 3 free contacts, each chat/call uses ${contact.next_contact_cost} credit (balance ${contact?.balance ?? 0}).`
                  : "Sign in to chat or call. Contact stays masked until you open it."}
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={bookNow}
            className="mt-5 h-12 w-full rounded-xl bg-[#0b1220] text-[16px] font-bold text-white active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Booking…" : "Book now & pay"}
          </button>
          <button type="button" onClick={startChat} className="mt-2 h-12 w-full rounded-xl bg-[#2563eb] text-[16px] font-bold text-white active:scale-[0.99]">
            Chat
          </button>
          <form onSubmit={sendOffer} className="mt-4">
            <p className="text-[15px] font-bold">Or post a job offer</p>
            <label className="mt-2 flex h-12 items-center rounded-xl border border-[#cfd4da] px-3 text-[18px] font-bold">
              $
              <input value={offer} onChange={(e) => setOffer(e.target.value)} inputMode="decimal" className="ml-2 h-full min-w-0 flex-1 border-0 bg-transparent text-[#14181d] outline-none" />
            </label>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button type="submit" disabled={busy} className="h-12 rounded-xl border-2 border-[#2563eb] text-[16px] font-bold text-[#2563eb] active:scale-[0.99]">
                {busy ? "Sending…" : "Send offer"}
              </button>
              <button type="button" onClick={call} className="h-12 rounded-xl border border-[#d7dbe0] px-4 text-[16px] font-bold">
                Call
              </button>
            </div>
          </form>
          {showChat && (
            <div className="mt-4">
              <div className="max-h-40 space-y-2 overflow-auto">
                {messages.map((row) => (
                  <p key={row.id} className={`rounded-md px-3 py-2 text-sm text-[#14181d] ${row.mine ? "bg-[#e8f0ff]" : "bg-[#f3f4f6]"}`}>{row.body}</p>
                ))}
              </div>
              <form onSubmit={sendChat} className="mt-2 flex gap-2">
                <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Message" className="h-11 flex-1 rounded-md border border-[#cfd4da] px-3 text-[#14181d]" />
                <button className="h-11 rounded-md bg-[#14181d] px-3 text-sm font-bold text-white">Send</button>
              </form>
            </div>
          )}
          {note && <p className="mt-3 text-sm font-medium text-[#9a3412]">{note}</p>}
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1220]/80 p-4" onClick={() => setLightbox(false)}>
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between text-sm text-white">
              <span>{service.title} · {photoIndex + 1}/{photos.length}</span>
              <button type="button" onClick={() => setLightbox(false)} className="size-9 rounded-full bg-white/10">✕</button>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <img src={current} alt="" className="max-h-[70vh] w-full object-contain" />
              <button type="button" onClick={() => shift(-1)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-lg">‹</button>
              <button type="button" onClick={() => shift(1)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-lg">›</button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {photos.map((src, index) => (
                <button key={`${src}-full`} type="button" onClick={() => setPhotoIndex(index)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ${index === photoIndex ? "ring-2 ring-white" : ""}`}>
                  <img src={src} alt="" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
