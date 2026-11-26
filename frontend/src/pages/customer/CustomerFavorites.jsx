import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";
import StarRating from "../../components/StarRating";
import { GlyphHeart } from "../../components/ui/DashboardGlyphs";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

export default function CustomerFavorites() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/favorites")
      .then((res) => setProviders(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountLayout title="Saved Pros" subtitle="Pros you’ve favorited — contact them anytime.">
      {loading && <p className="text-sm text-[#64748b]">Loading…</p>}
      {!loading && providers.length === 0 && (
        <div className="rounded-[24px] border border-[#E7EAF0] bg-white p-8 text-center text-sm text-[#64748b]">
          No saved pros yet.{" "}
          <Link to="/search" className="font-semibold text-[#5b46f5] hover:underline">
            Find a pro
          </Link>{" "}
          and tap the heart on their profile.
        </div>
      )}
      <ul className="space-y-3">
        {providers.map((p) => {
          const trade = p.services?.[0]?.category?.name || "Home services";
          return (
            <li
              key={p.id || p.provider_id}
              className="flex flex-col gap-4 rounded-[22px] border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-lg font-bold text-[#6D28D9]">
                {(p.business_name || p.full_name || "P").charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#0b1220]">{p.business_name || p.full_name}</p>
                <p className="mt-0.5 text-[12px] text-[#64748b]">{trade}</p>
                <div className="mt-1">
                  <StarRating rating={p.avg_rating || 4.8} count={p.review_count || 0} size={12} />
                </div>
              </div>
              <span className="text-[#ef4444]" aria-label="Saved">
                <GlyphHeart className="size-5" filled />
              </span>
              <Link
                to={`/providers/${p.id || p.provider_id}`}
                className={`${press} inline-flex h-10 shrink-0 items-center rounded-xl bg-[#5b46f5] px-5 text-[13px] font-bold text-white`}
              >
                Contact
              </Link>
            </li>
          );
        })}
      </ul>
    </AccountLayout>
  );
}