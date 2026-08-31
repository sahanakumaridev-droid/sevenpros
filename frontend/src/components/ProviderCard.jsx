import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const GRADIENTS = [
  "from-brand-500 to-brand-800",
  "from-sky-700 to-blue-950",
  "from-amber-700 to-orange-950",
  "from-violet-700 to-purple-950",
  "from-rose-800 to-red-950",
];

function gradientFor(id) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % GRADIENTS.length;
  return GRADIENTS[hash];
}

export default function ProviderCard({ provider, detailed = false }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(provider.is_favorite);
  const [imgFailed, setImgFailed] = useState(false);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const res = await client.post(`/providers/${provider.id}/favorite`);
    setIsFav(res.data.is_favorite);
  };

  const category = provider.services?.[0]?.category?.name;
  const showPhoto = provider.cover_photo_url && !imgFailed;
  const serviceId = provider.services?.[0]?.id;
  const tags = (provider.services || [])
    .map((s) => s.category?.name)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

  if (detailed) {
    return (
      <article className="overflow-hidden rounded-2xl bg-white border border-[#E6EEF7] shadow-[0_8px_24px_rgba(7,26,58,0.06)]">
        <div className={`relative h-40 bg-gradient-to-br ${gradientFor(provider.id)}`}>
          {showPhoto && (
            <img
              src={provider.cover_photo_url}
              alt=""
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {provider.is_available && (
            <span className="absolute top-3 left-3 rounded-full bg-[#1BBF7A] text-white text-[11px] font-semibold px-2.5 py-1">
              Available Today
            </span>
          )}
          {provider.is_verified && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white text-blue text-[11px] font-semibold px-2.5 py-1">
              Verified Pro
            </span>
          )}
          <button
            type="button"
            onClick={toggleFav}
            aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
            className="absolute top-3 right-3 size-8 rounded-full bg-white/95 text-navy grid place-items-center shadow-sm"
          >
            {isFav ? "♥" : "♡"}
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-2.5">
            <div className="size-10 rounded-full bg-[#EEF4FB] flex items-center justify-center text-sm font-bold text-navy shrink-0">
              {provider.business_name[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-bold text-navy truncate">{provider.business_name}</h3>
                {provider.is_verified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                    <circle cx="12" cy="12" r="10" fill="#00AEEF" />
                    <path d="M8 12.2l2.2 2.2L16 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <p className="text-[12px] text-slate mt-0.5">
                {provider.years_experience ? `${provider.years_experience}+ years` : "Local pro"}
                {category ? ` · ${category}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <StarRating rating={provider.avg_rating} count={provider.review_count} />
          </div>
          {tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#F0F5FB] text-navy/80 text-[11px] font-medium px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-slate">Starting at</span>
            <span className="font-bold text-navy tabular-nums">
              {provider.starting_price != null ? `$${provider.starting_price}` : "Get quote"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to={`/providers/${provider.id}`}
              className="h-10 rounded-xl border border-[#D7E3F0] text-navy text-sm font-semibold inline-flex items-center justify-center hover:bg-[#F5F8FC]"
            >
              View Profile
            </Link>
            <Link
              to={serviceId ? `/book/${provider.id}/${serviceId}` : `/providers/${provider.id}`}
              className="h-10 rounded-xl bg-brand-grad text-white text-sm font-semibold inline-flex items-center justify-center gap-1 hover:opacity-95"
            >
              Book Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <Link viewTransition to={`/providers/${provider.id}`} className="group lift pressable block overflow-hidden rounded-2xl bg-white border border-[#E6EEF7] shadow-[0_8px_24px_rgba(7,26,58,0.06)]">
      <div className={`h-32 relative bg-gradient-to-br ${gradientFor(provider.id)}`}>
        {showPhoto && (
          <>
            <img
              src={provider.cover_photo_url}
              alt=""
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ viewTransitionName: `listing-photo-${provider.id}` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          </>
        )}
        <div className="relative h-full flex items-end p-3">
          {provider.is_verified && (
            <span className="bg-white/95 text-blue text-xs font-semibold px-2 py-1 rounded-full">
              ✔ Verified
            </span>
          )}
        </div>
        <button
          onClick={toggleFav}
          aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
          className="absolute top-2 right-2 size-8 rounded-full bg-overlay/90 flex items-center justify-center text-lg"
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-full bg-[#F5F8FC] flex items-center justify-center text-sm font-bold text-navy">
            {provider.business_name[0]}
          </div>
          <div className="text-sm font-semibold text-navy truncate">{provider.business_name}</div>
        </div>
        {category && <div className="text-xs text-slate mb-2">{category}</div>}
        <p className="text-sm text-slate line-clamp-2 mb-2 min-h-[2.5rem]">{provider.tagline}</p>
        <div className="flex items-center justify-between">
          <StarRating rating={provider.avg_rating} count={provider.review_count} />
          {provider.distance_km != null && (
            <span className="text-xs text-faint tabular-nums">{provider.distance_km} km</span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-[#E6EEF7] flex items-center justify-between">
          <span className="text-xs text-slate">Starting at</span>
          <span className="font-bold text-navy tabular-nums">
            {provider.starting_price != null ? `$${provider.starting_price}` : "Get quote"}
          </span>
        </div>
      </div>
    </Link>
  );
}
