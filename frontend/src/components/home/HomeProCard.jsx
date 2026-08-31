import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import { useState } from "react";

export default function HomeProCard({ provider }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(provider.is_favorite);
  const [imgFailed, setImgFailed] = useState(false);
  const tags = (provider.services || []).slice(0, 2).map((s) => s.category?.name || s.title).filter(Boolean);
  const showPhoto = provider.cover_photo_url && !imgFailed;
  const firstService = provider.services?.[0];

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const res = await client.post(`/providers/${provider.id}/favorite`);
    setIsFav(res.data.is_favorite);
  };

  return (
    <article className="home-pro-card pressable h-full rounded-2xl bg-white border border-[#E6EEF7] shadow-[0_10px_28px_rgba(7,26,58,0.08)] p-4 flex flex-col">
      <Link viewTransition to={`/providers/${provider.id}`} className="flex items-start justify-between gap-3">
        <div className="relative size-[72px] rounded-xl overflow-hidden bg-[#E8EEF6] shrink-0">
          {showPhoto ? (
            <img
              src={provider.cover_photo_url}
              alt=""
              onError={() => setImgFailed(true)}
              className="size-full object-cover"
              style={{ viewTransitionName: `listing-photo-${provider.id}` }}
            />
          ) : (
            <div className="size-full grid place-items-center text-xl font-bold text-navy">{provider.business_name[0]}</div>
          )}
          {provider.is_verified && (
            <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#22C55E] text-white grid place-items-center ring-2 ring-white" aria-label="Verified">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.2l2.2 2.3 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleFav}
          aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
          className="size-9 rounded-full text-slate hover:bg-[#F5F8FC] grid place-items-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "#E11D48" : "none"} aria-hidden="true">
            <path
              d="M12 20s-7-4.4-9.3-8.2C1 9.2 2.2 6 5.5 6c2 0 3.3 1.2 4.1 2.3C10.4 7.2 11.7 6 13.7 6c3.3 0 4.5 3.2 2.8 5.8C14.2 15.6 12 20 12 20z"
              stroke={isFav ? "#E11D48" : "#94A3B8"}
              strokeWidth="1.7"
            />
          </svg>
        </button>
      </Link>

      <Link viewTransition to={`/providers/${provider.id}`} className="mt-3 block">
        <h3 className="font-bold text-navy truncate">{provider.business_name}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="text-[#F5B400]" aria-hidden="true">★</span>
          <span className="font-semibold text-navy tabular-nums">{provider.avg_rating?.toFixed(1)}</span>
          <span className="text-slate tabular-nums">({provider.review_count})</span>
        </div>
        <p className="mt-1 text-sm text-slate">
          {provider.city ? `${provider.city}, ${provider.state}` : provider.state}
        </p>
        {provider.tagline && <p className="mt-2 text-sm text-navy/70 line-clamp-2">{provider.tagline}</p>}
      </Link>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-blue/10 text-blue text-[11px] font-semibold px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
        <Link
          viewTransition
          to={`/providers/${provider.id}`}
          className="inline-flex items-center justify-center min-h-10 rounded-xl border border-[#CBD5E1] text-navy text-sm font-semibold hover:bg-[#F5F8FC]"
        >
          View details
        </Link>
        <Link
          viewTransition
          to={firstService ? `/book/${provider.id}/${firstService.id}` : `/providers/${provider.id}`}
          className="inline-flex items-center justify-center min-h-10 rounded-xl bg-brand-grad text-white text-sm font-semibold"
        >
          Book
        </Link>
      </div>
    </article>
  );
}
