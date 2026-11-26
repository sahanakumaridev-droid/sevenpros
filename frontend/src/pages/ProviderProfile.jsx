import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

const COVER_POOLS = {
  plumber: ["plumb-1", "plumb-2", "handy-1"],
  electrician: ["elec-1", "elec-2", "elec-3"],
  hvac: ["hvac-1", "handy-2", "plumb-1"],
  cleaning: ["clean-1", "clean-2", "clean-3", "clean-4", "clean-5", "clean-6"],
  painter: ["paint-1", "handy-3", "floor-2"],
  gardener: ["garden-1", "garden-2"],
  flooring: ["floor-1", "floor-2", "handy-1"],
  handyman: ["handy-1", "handy-2", "handy-3", "floor-1", "paint-1"],
};

function coverFor(provider) {
  const name = `${provider.services?.[0]?.category?.name || ""} ${provider.tagline || ""} ${provider.business_name || ""}`.toLowerCase();
  let key = "handyman";
  if (name.includes("plumb") || name.includes("water")) key = "plumber";
  else if (name.includes("electric")) key = "electrician";
  else if (name.includes("hvac") || name.includes("air") || name.includes("heat")) key = "hvac";
  else if (name.includes("clean")) key = "cleaning";
  else if (name.includes("paint")) key = "painter";
  else if (name.includes("garden") || name.includes("land")) key = "gardener";
  else if (name.includes("floor") || name.includes("drywall") || name.includes("remodel")) key = "flooring";
  const pool = COVER_POOLS[key];
  let hash = 0;
  for (const ch of provider.id) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return `/trades/${pool[hash % pool.length]}.jpg`;
}

export default function ProviderProfile() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      client.get(`/providers/${providerId}`),
      client.get(`/reviews/provider/${providerId}`),
      client.get(`/ai/reviews/${providerId}/summary`).catch(() => ({ data: null })),
    ]).then(([pRes, rRes, aRes]) => {
      setProvider(pRes.data);
      setReviews(rRes.data);
      setAiSummary(aRes.data);
    }).catch(() => {
      setProvider(null);
    }).finally(() => setLoading(false));
  }, [providerId]);

  const toggleFav = async () => {
    if (!user) return;
    const res = await client.post(`/providers/${providerId}/favorite`);
    setProvider((p) => ({ ...p, is_favorite: res.data.is_favorite }));
  };

  if (loading) return <div className="container-page py-16 text-faint">Loading listing…</div>;
  if (!provider) return <div className="container-page py-16 text-faint">Provider not found.</div>;

  const badges = [
    provider.is_licensed && "Licensed",
    provider.is_insured && "Insured",
    provider.is_background_checked && "Background checked",
  ].filter(Boolean);
  const cover =
    provider.cover_photo_url && !provider.cover_photo_url.includes("loremflickr.com") && !imgFailed
      ? provider.cover_photo_url
      : coverFor(provider);
  const primary = provider.services?.[0];
  const starting = provider.services?.length
    ? Math.min(...provider.services.map((s) => s.price_min || 0))
    : null;

  return (
    <div className="bg-surface text-ink pb-24 lg:pb-16 min-h-full">
      <div className="container-page pt-6">
        <Link to="/search" className="text-sm font-semibold text-blue">
          ← Back to listings
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row gap-5 items-start">
          <img
            src={cover}
            alt=""
            onError={() => setImgFailed(true)}
            className="h-56 w-44 sm:h-64 sm:w-52 rounded-2xl object-cover object-[center_18%] bg-overlay shrink-0"
          />
          <div className="min-w-0 pt-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-[-0.03em]">{provider.business_name}</h1>
            <p className="mt-2 text-slate">{provider.tagline}</p>
          </div>
        </div>
      </div>

      <div className="container-page mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-raised p-5 md:p-6 shadow-[0_8px_24px_rgba(7,26,58,0.05)]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate">
              <StarRating rating={provider.avg_rating} count={provider.review_count} size={16} />
              <span>{provider.city}, {provider.state}</span>
              <span>Responds in ~{provider.response_time_minutes} min</span>
              <span>{provider.years_experience} yrs experience</span>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map((b) => (
                  <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-overlay text-[#0369A1]">
                    {b}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-5 text-slate leading-relaxed">{provider.about}</p>
          </div>

          <section className="rounded-2xl border border-line bg-raised p-5 md:p-6" id="services">
            <h2 className="text-lg font-bold mb-4">Services and pricing</h2>
            <div className="divide-y divide-line">
              {provider.services.map((s) => (
                <div key={s.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-slate mt-0.5">{s.description}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.is_instant_booking && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-overlay text-[#0369A1]">Instant booking</span>
                      )}
                      {s.offers_free_estimate && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-overlay text-slate">Free estimate</span>
                      )}
                      {s.is_emergency && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF6E5] text-[#B45309]">Emergency</span>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="font-bold tabular-nums">
                      {s.price_type === "quote" ? "Get quote" : `$${s.price_min}${s.price_max ? `–$${s.price_max}` : ""}`}
                      {s.price_type === "hourly" && <span className="text-xs text-slate">/hr</span>}
                    </div>
                    <Link to={`/book/${provider.id}/${s.id}`} className="mt-2 inline-flex btn btn-primary h-10 text-sm rounded-xl px-4">
                      Book this service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-raised p-5 md:p-6">
            <h2 className="text-lg font-bold mb-4">Reviews ({reviews.length})</h2>
            {aiSummary?.summary && (
              <p className="mb-4 text-sm text-slate border-l-2 border-blue pl-3">{aiSummary.summary}</p>
            )}
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-slate text-sm">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-8 rounded-full bg-overlay grid place-items-center text-xs font-bold">
                      {r.customer.full_name[0]}
                    </div>
                    <div className="text-sm font-semibold">{r.customer.full_name}</div>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <p className="text-sm text-slate">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-line bg-raised p-5 shadow-[0_8px_24px_rgba(7,26,58,0.05)]">
          <p className="text-sm text-slate">Starting from</p>
          <p className="text-3xl font-bold tabular-nums tracking-[-0.03em]">{starting != null ? `$${starting}` : "Quote"}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Service area</dt>
              <dd className="font-semibold">{provider.service_radius_km} km</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Typical response</dt>
              <dd className="font-semibold">{provider.response_time_minutes} min</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-slate">Direct phone and email stay off the public profile. Post a job and pros respond with credits.</p>
          {primary ? (
            <Link to={`/book/${provider.id}/${primary.id}`} className="mt-5 btn btn-primary w-full h-12 rounded-xl">
              Book now
            </Link>
          ) : (
            <p className="mt-4 text-sm text-slate">No bookable services yet.</p>
          )}
          <button type="button" onClick={toggleFav} className="mt-2 w-full h-11 rounded-xl border border-line text-sm font-semibold">
            {provider.is_favorite ? "Saved" : "Save"}
          </button>
        </aside>
      </div>

      {primary && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-raised px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-slate uppercase tracking-wide">From</p>
              <p className="font-bold tabular-nums">{starting != null ? `$${starting}` : "Quote"}</p>
            </div>
            <Link to={`/book/${provider.id}/${primary.id}`} className="btn btn-primary flex-1 h-12 rounded-xl">
              Book now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
