import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { photoForItem } from "../lib/photos";

export default function PublicPeek({ item, onClose }) {
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDetail(null);
    setNote("");
    client.get(`/credits/public/${item.id}`).then((res) => setDetail(res.data)).catch(() => setDetail({
      name: item.name,
      category: item.category,
      city: item.city,
      state: item.state || "CA",
      opened: false,
      balance: 0,
    }));
  }, [item]);

  const reveal = async () => {
    setNote("");
    try {
      const res = await client.post(`/credits/public/${item.id}/open`);
      setDetail(res.data);
    } catch (err) {
      if (err.response?.status === 401) setNote("Sign in, then use 1 credit to open the address and phone.");
      else setNote(err.response?.data?.detail || "Could not open this listing.");
    }
  };

  const move = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    setTilt({ x, y });
  };

  const view = detail || item;
  const photo = photoForItem(item, new Set());

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#071018]/55 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md [perspective:900px]"
        onClick={(event) => event.stopPropagation()}
        onMouseMove={move}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <article
          className="overflow-hidden rounded-[28px] bg-white text-[#14181d] shadow-[0_30px_80px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${(-tilt.y * 8).toFixed(2)}deg) rotateY(${(tilt.x * 10).toFixed(2)}deg)` }}
        >
          <img src={photo} alt="" className="h-52 w-full object-cover object-top" />
          <div className="p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0b7c73]">{view.category || "Service"}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{view.name}</h2>
            <p className="mt-1 text-sm text-[#5c6770]">{[view.city, view.state || "CA"].filter(Boolean).join(", ")}</p>
            {view.opened ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="text-[#5c6770]">Address</dt><dd className="font-medium">{[view.street, view.city, view.postcode].filter(Boolean).join(", ") || "Not on file"}</dd></div>
                <div><dt className="text-[#5c6770]">Phone</dt><dd className="font-medium">{view.phone || "Not on file"}</dd></div>
                <div><dt className="text-[#5c6770]">Hours</dt><dd className="font-medium">{view.hours || "Not on file"}</dd></div>
              </dl>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#f4f6f8] p-4">
                <p className="text-sm font-medium">Address, phone, and hours stay locked.</p>
                <p className="mt-1 text-sm text-[#5c6770]">1 credit opens this public record. The same place is not charged again.</p>
                <div className="mt-3 h-3 w-3/4 rounded bg-[#e4e7eb]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#e4e7eb]" />
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {!view.opened && (
                <button type="button" onClick={reveal} className="h-11 rounded-full bg-[#14181d] px-4 text-sm font-semibold text-white active:scale-[0.98]">
                  Use 1 credit
                </button>
              )}
              <Link to="/credits" className="inline-flex h-11 items-center rounded-full border border-[#14181d] px-4 text-sm font-semibold">
                Best offer · 3 contacts · $19
              </Link>
              <button type="button" onClick={onClose} className="h-11 rounded-full px-3 text-sm font-semibold text-[#5c6770]">Close</button>
            </div>
            {note && <p className="mt-3 text-sm text-[#9a3412]">{note}</p>}
          </div>
        </article>
      </div>
    </div>
  );
}
