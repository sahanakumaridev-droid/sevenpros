import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COVERAGE, placeOptions, placePoint, writePlace } from "../../lib/coverage";

const MARKETS = [
  { country: "US", region: "California", label: "California", hint: "USA" },
  { country: "CA", region: "Ontario", label: "Canada", hint: "Nationwide cities" },
];

function formatQuery(place) {
  if (place.city) return `${place.city}, ${place.country === "CA" ? "Canada" : "CA"}`;
  if (place.country === "CA") return "Canada";
  return "California, USA";
}

function nearestCity(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  placeOptions().forEach((row) => {
    const [plat, plng] = placePoint(row);
    const dist = (plat - lat) ** 2 + (plng - lng) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = row;
    }
  });
  return best;
}

export default function LocationPicker({ place, onClose, onApply }) {
  const [query, setQuery] = useState(formatQuery(place));
  const [draft, setDraft] = useState(place);
  const [miles, setMiles] = useState(place.miles || 25);
  const [locating, setLocating] = useState(false);
  const node = useRef(null);
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const pinRef = useRef(null);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return placeOptions()
      .filter(
        (row) =>
          row.label.toLowerCase().includes(q) ||
          row.county.toLowerCase().includes(q) ||
          row.region.toLowerCase().includes(q) ||
          COVERAGE[row.country]?.label.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query]);

  const thumbPct = ((miles - 5) / 95) * 100;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    if (!node.current || mapRef.current) return undefined;
    const [lat, lng] = placePoint(draft);
    const map = L.map(node.current, { zoomControl: false, attributionControl: true }).setView([lat, lng], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const [lat, lng] = placePoint(draft);
    map.setView([lat, lng], miles > 40 ? 8 : draft.city ? 10 : 7);
    if (circleRef.current) circleRef.current.remove();
    if (pinRef.current) pinRef.current.remove();
    circleRef.current = L.circle([lat, lng], {
      radius: miles * 1609.34,
      color: "#0b7c73",
      weight: 1.5,
      fillColor: "#ffffff",
      fillOpacity: 0.35,
    }).addTo(map);
    pinRef.current = L.circleMarker([lat, lng], {
      radius: 7,
      color: "#14181d",
      fillColor: "#14181d",
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);
  }, [draft, miles]);

  const pickMarket = (market) => {
    const next = {
      country: market.country,
      region: market.region,
      county: "",
      city: "",
      miles,
    };
    setDraft(next);
    setQuery(market.country === "CA" ? "Canada" : "California, USA");
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const row = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (row) {
          setDraft({ country: row.country, region: row.region, county: row.county, city: row.city, miles });
          setQuery(row.label);
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const apply = () => {
    const next = writePlace({ ...draft, miles });
    onApply?.(next);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-[#14181d]/45 px-4 pt-[max(4.5rem,12vh)] pb-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Location"
        className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#0b7c73]/55 bg-white p-5 text-[#14181d] shadow-[0_28px_80px_rgba(0,0,0,0.22)] motion-safe:[animation:rise-in_220ms_var(--ease-out)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-[#5c6770] transition-colors hover:bg-[#F4F6F8]"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="text-center text-[22px] font-bold tracking-[-0.03em]">Location</h2>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {MARKETS.map((market) => {
            const active = draft.country === market.country;
            return (
              <button
                key={market.country}
                type="button"
                onClick={() => pickMarket(market)}
                className={`rounded-xl px-3 py-2.5 text-left transition-[background-color,box-shadow,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] ${
                  active
                    ? "bg-[#0b7c73] text-white shadow-[0_8px_20px_rgba(11,124,115,0.28)]"
                    : "bg-[#F4F6F8] text-[#14181d] ring-1 ring-[#E4E7EB]"
                }`}
              >
                <span className="block text-[13px] font-bold">{market.label}</span>
                <span className={`block text-[11px] ${active ? "text-white/80" : "text-[#64748b]"}`}>{market.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={draft.country === "CA" ? "Toronto, Canada" : "Los Angeles, CA"}
            className="h-12 w-full rounded-full border border-[#e4e7eb] bg-white pl-10 pr-10 text-[15px] outline-none transition-[border-color,box-shadow] focus:border-[#0b7c73] focus:shadow-[0_0_0_3px_rgba(11,124,115,0.12)]"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[#94a3b8] hover:bg-[#F4F6F8] hover:text-[#475569]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {options.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-[#e4e7eb] bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              {options.map((row) => (
                <li key={`${row.country}-${row.city}-${row.county}`}>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[#F4F6F8]"
                    onClick={() => {
                      setDraft({ country: row.country, region: row.region, county: row.county, city: row.city, miles });
                      setQuery(row.label);
                    }}
                  >
                    <span className="font-semibold">{row.city}</span>
                    <span className="block text-xs text-[#64748b]">
                      {row.county} · {row.country === "CA" ? "Canada" : "California"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-[#E4E7EB]">
          <div ref={node} className="h-52 w-full" />
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            aria-label="Use current location"
            className="absolute right-3 top-3 z-[500] grid size-10 place-items-center rounded-full bg-white text-[#0b7c73] shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition-transform duration-160 active:scale-[0.96] disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          <p className="text-[15px] font-bold">Distance</p>
          <div className="relative mt-6 px-1">
            <div
              className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-[12px] font-semibold text-[#14181d] shadow-[0_6px_16px_rgba(15,23,42,0.12)] ring-1 ring-[#E8ECF1]"
              style={{ left: `${thumbPct}%` }}
            >
              {miles} miles
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={miles}
              onChange={(e) => setMiles(Number(e.target.value))}
              className="location-range w-full"
              style={{ "--location-pct": `${thumbPct}%` }}
              aria-label="Search distance in miles"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={apply}
          className="mt-5 h-12 w-full rounded-full bg-[#0b7c73] text-[16px] font-bold text-white transition-[transform,filter] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-105 active:scale-[0.98]"
        >
          See listings
        </button>
      </div>
    </div>,
    document.body,
  );
}
