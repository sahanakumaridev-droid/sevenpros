import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import { useState } from "react";

function photoFor(provider) {
  const blob = `${(provider.services || []).map((s) => s.category?.name || s.title).join(" ")} ${provider.tagline || ""} ${provider.business_name || ""}`.toLowerCase();
  if (blob.includes("plumb")) return "plumbing";
  if (blob.includes("elect")) return "electrical";
  if (blob.includes("hvac") || blob.includes("heat") || blob.includes("air")) return "hvac";
  if (blob.includes("clean")) return "cleaning";
  if (blob.includes("paint")) return "painting";
  if (blob.includes("land") || blob.includes("garden")) return "landscaping";
  if (blob.includes("appliance")) return "appliance-repair";
  return "handyman";
}

export default function HomeProCard({ provider }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(provider.is_favorite);
  const [imgFailed, setImgFailed] = useState(false);
  const tags = (provider.services || []).slice(0, 2).map((s) => s.category?.name || s.title).filter(Boolean);
  const firstService = provider.services?.[0];
  const remote = provider.cover_photo_url && !provider.cover_photo_url.includes("loremflickr") && !imgFailed;
  const photo = remote ? provider.cover_photo_url : `/categories/${photoFor(provider)}.jpg?v=2`;

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const res = await client.post(`/providers/${provider.id}/favorite`);
    setIsFav(res.data.is_favorite);
  };

  return (
    <article className="h-full overflow-hidden rounded-[20px] bg-white border border-[#e6e8eb] shadow-[0_12px_32px_rgba(20,24,29,0.06)] flex flex-col">
      <Link to={`/providers/${provider.id}`} className="relative block">
        <img src={photo} alt="" onError={() => setImgFailed(true)} className="h-56 w-full object-cover object-top" />
        <button
          type="button"
          onClick={toggleFav}
          aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
          className="absolute top-3 right-3 size-9 rounded-full bg-white text-slate grid place-items-center shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "#E11D48" : "none"} aria-hidden="true">
            <path
              d="M12 20s-7-4.4-9.3-8.2C1 9.2 2.2 6 5.5 6c2 0 3.3 1.2 4.1 2.3C10.4 7.2 11.7 6 13.7 6c3.3 0 4.5 3.2 2.8 5.8C14.2 15.6 12 20 12 20z"
              stroke={isFav ? "#E11D48" : "#64748b"}
              strokeWidth="1.7"
            />
          </svg>
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/providers/${provider.id}`}>
          <h3 className="font-bold text-[#14181d] truncate">{provider.business_name}</h3>
          <p className="mt-1 text-sm text-[#5c6770]">
            {provider.review_count > 0 ? `${Number(provider.avg_rating).toFixed(1)} ★ · ${provider.review_count}` : "No reviews yet"}
            {provider.city ? ` · ${provider.city}` : ""}
          </p>
        </Link>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#e8f6fb] text-[#0b7c73] text-[11px] font-semibold px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
          <Link to={`/providers/${provider.id}`} className="inline-flex items-center justify-center min-h-10 rounded-xl border border-[#e4e7eb] text-sm font-semibold">
            View
          </Link>
          <Link
            to={firstService ? `/book/${provider.id}/${firstService.id}` : `/providers/${provider.id}`}
            className="inline-flex items-center justify-center min-h-10 rounded-xl bg-[#14181d] text-white text-sm font-semibold"
          >
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
