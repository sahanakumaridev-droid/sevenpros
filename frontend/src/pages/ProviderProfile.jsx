import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

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
  const primary = provider.services?.[0];
  const starting = provider.services?.length
    ? Math.min(...provider.services.map((s) => s.price_min || 0))
    : null;

  return (
    <div className="pb-24 lg:pb-16">
      <div className="relative h-52 md:h-72 overflow-hidden bg-navy">
        {provider.cover_photo_url && !imgFailed && (
          <img
            src={provider.cover_photo_url}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 size-full object-cover"
            style={{ viewTransitionName: `listing-photo-${provider.id}` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/20" />
        <div className="absolute bottom-0 inset-x-0 container-page pb-6">
          <Link viewTransition to="/search" className="text-xs text-white/70 hover:text-white">
            ← Back to listings
          </Link>
          <h1 className="mt-2 text-2xl md:text-4xl font-bold text-white tracking-tight">{provider.business_name}</h1>
          <p className="text-white/75 mt-1">{provider.tagline}</p>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 -mt-6 relative z-10">
        <div className="space-y-6">
          <div className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={provider.avg_rating} count={provider.review_count} size={16} />
              <span className="text-sm text-muted">
                {provider.city}, {provider.state}
              </span>
              <span className="text-sm text-muted">Responds in ~{provider.response_time_minutes} min</span>
              <span className="text-sm text-muted">{provider.years_experience} yrs experience</span>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map((b) => (
                  <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/8 text-cyan">
                    ✔ {b}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-5 text-muted leading-relaxed">{provider.about}</p>
          </div>

          <section className="card p-5 md:p-6" id="services">
            <h2 className="text-lg font-bold text-ink mb-4">Services &amp; pricing</h2>
            <div className="space-y-3">
              {provider.services.map((s) => (
                <div key={s.id} className="rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink">{s.title}</div>
                    <div className="text-sm text-muted mt-0.5">{s.description}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.is_instant_booking && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan/15 text-cyan">Instant booking</span>
                      )}
                      {s.offers_free_estimate && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/8 text-muted">Free estimate</span>
                      )}
                      {s.is_emergency && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/8 text-warn">Emergency</span>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="font-bold text-ink tabular-nums">
                      {s.price_type === "quote" ? "Get quote" : `$${s.price_min}${s.price_max ? `–$${s.price_max}` : ""}`}
                      {s.price_type === "hourly" && <span className="text-xs text-faint">/hr</span>}
                    </div>
                    <Link viewTransition to={`/book/${provider.id}/${s.id}`} className="mt-2 inline-flex btn btn-primary h-10 text-sm rounded-xl px-4">
                      Book this service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h2 className="text-lg font-bold text-ink mb-3">
              Reviews <span className="text-faint font-normal">({reviews.length})</span>
            </h2>
            {aiSummary?.summary && (
              <div className="mb-4 rounded-xl border border-white/10 bg-overlay p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-cyan mb-1">AI review summary</p>
                <p className="text-sm text-ink">{aiSummary.summary}</p>
              </div>
            )}
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-faint text-sm">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-8 rounded-full bg-overlay grid place-items-center text-xs font-bold">
                      {r.customer.full_name[0]}
                    </div>
                    <div className="text-sm font-medium">{r.customer.full_name}</div>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <p className="text-sm text-muted">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="card p-5">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-faint">Listing preview</p>
            <p className="mt-2 text-sm text-muted">Starting from</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{starting != null ? `$${starting}` : "Quote"}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Service area</dt>
                <dd>{provider.service_radius_km} km</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Match score</dt>
                <dd className="tabular-nums">{provider.match_score ?? "Best match"}</dd>
              </div>
            </dl>
            {primary ? (
              <Link viewTransition to={`/book/${provider.id}/${primary.id}`} className="mt-5 btn btn-primary w-full h-12 rounded-xl">
                Continue to booking
              </Link>
            ) : (
              <p className="mt-4 text-sm text-faint">No bookable services yet.</p>
            )}
            <button type="button" onClick={toggleFav} className="mt-2 w-full h-11 rounded-xl border border-line text-sm font-semibold">
              {provider.is_favorite ? "Saved to favorites" : "Save listing"}
            </button>
            <p className="mt-3 text-[11px] text-faint text-center">Secure checkout · Dummy card accepted for demo</p>
          </div>
        </aside>
      </div>

      {primary && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0c1224]/95 backdrop-blur-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-white/50 uppercase tracking-wide">From</p>
              <p className="font-bold text-white tabular-nums">{starting != null ? `$${starting}` : "Quote"}</p>
            </div>
            <Link viewTransition to={`/book/${provider.id}/${primary.id}`} className="btn btn-primary flex-1 h-12 rounded-xl">
              Continue to booking
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
