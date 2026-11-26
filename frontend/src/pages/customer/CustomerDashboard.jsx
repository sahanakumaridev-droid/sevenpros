import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../../api/client";
import DashboardShell from "../../components/DashboardShell";
import StarRating from "../../components/StarRating";
import { useAuth } from "../../context/AuthContext";
import { photoForItem } from "../../lib/photos";
import { POPULAR_CATEGORIES } from "../../data/popularCategories";
import {
  GlyphCrown,
  GlyphHeadset,
  GlyphHeart,
  QuickActionGlyph,
} from "../../components/ui/DashboardGlyphs";

const DASH_CATS = [
  ...POPULAR_CATEGORIES.filter((c) =>
    ["plumbing", "electrical", "hvac", "cleaning", "handyman", "painting", "landscaping"].includes(c.slug),
  ),
  { name: "Moving", slug: "moving", apiSlug: "moving-services" },
].slice(0, 8);

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

const QUICK_ACTIONS = [
  {
    title: "Post a Project",
    desc: "Tell us what you need",
    to: "/post",
    tone: "bg-[#EDE9FE] text-[#6D28D9]",
    glyph: "plus",
  },
  {
    title: "View Saved",
    desc: "Your favorite pros",
    to: "/account/favorites",
    tone: "bg-[#DBEAFE] text-[#1D4ED8]",
    glyph: "heart",
  },
  {
    title: "My Messages",
    desc: "Chat with pros",
    to: "/account/messages",
    tone: "bg-[#DCFCE7] text-[#15803D]",
    glyph: "mail",
  },
  {
    title: "My Reviews",
    desc: "Share your feedback",
    to: "/account/profile",
    tone: "bg-[#FFEDD5] text-[#C2410C]",
    glyph: "star",
  },
];

function categoryCover(provider) {
  const cat = (provider.services?.[0]?.category?.name || "").toLowerCase();
  if (cat.includes("plumb")) return "/categories/plumbing.jpg";
  if (cat.includes("electric")) return "/categories/electrical.jpg";
  if (cat.includes("hvac")) return "/categories/hvac.jpg";
  if (cat.includes("clean")) return "/categories/cleaning.jpg";
  if (cat.includes("paint")) return "/categories/painting.jpg";
  if (cat.includes("land")) return "/categories/landscaping.jpg";
  return "/categories/handyman.jpg";
}

function SavedThumb({ img, name }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#E2E8F0]">
      {img ? (
        <img src={img} alt={name || ""} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-semibold text-[#94A3B8]">Saved</div>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-2 right-2 inline-flex size-7 items-center justify-center rounded-full bg-white/95 text-[#ef4444] shadow-sm"
      >
        <GlyphHeart className="size-3.5" filled />
      </span>
    </div>
  );
}

function RecentServicesGrid({ pros, pressClass }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {pros.map((pro) => {
        const cover =
          pro.cover_photo_url && !pro.cover_photo_url.includes("loremflickr")
            ? pro.cover_photo_url
            : categoryCover(pro);
        const city = pro.city || pro.service_area || "California";
        const category = pro.services?.[0]?.category?.name || "Services";
        const fav = Boolean(pro.is_favorite);
        return (
          <Link
            key={pro.id}
            to={`/providers/${pro.id}`}
            className={`${pressClass} overflow-hidden rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] shadow-[0_4px_14px_rgba(15,23,42,0.04)]`}
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-[#E2E8F0]">
              <img src={cover} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#64748b]">
                {category}
              </span>
              <span
                aria-hidden="true"
                className={`absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm ${
                  fav ? "text-[#ef4444]" : "text-[#94A3B8]"
                }`}
              >
                <GlyphHeart className="size-4" filled={fav} />
              </span>
            </div>
            <div className="p-3.5">
              <p className="truncate text-[13px] font-bold text-[#0b1220]">{pro.business_name || pro.full_name}</p>
              <div className="mt-1">
                <StarRating
                  rating={pro.avg_rating || 4.8}
                  count={pro.review_count || pro.reviews_count || 0}
                  size={12}
                />
              </div>
              <p className="mt-1 truncate text-[11px] text-[#64748b]">{city}</p>
              <span className="mt-2 inline-block rounded-lg border border-[#E7EAF0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#0b1220]">
                View Details
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProfileBlock({ name, email }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  return (
    <div className="mt-4 flex items-center gap-3">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5b46f5,#3b82f6)] text-lg font-bold text-white">
        {initial}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-bold text-[#0b1220]">{name || "Customer"}</span>
        <span className="block truncate text-[12px] text-[#64748b]">{email}</span>
      </span>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const [bookings, setBookings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      client.get("/bookings/mine").catch(() => ({ data: [] })),
      client.get("/credits/posts/mine").catch(() => ({ data: [] })),
      client.get("/favorites").catch(() => ({ data: [] })),
      client.get("/credits/inbox").catch(() => ({ data: { items: [] } })),
      client.get("/search/providers?sort=best_match&limit=5").catch(() => ({ data: [] })),
    ]).then(([b, p, f, i, s]) => {
      setBookings(b.data || []);
      setPosts(p.data || []);
      setFavorites(f.data || []);
      const data = i.data || {};
      const list = Array.isArray(data.items) ? data.items : Array.isArray(data.threads) ? data.threads : [];
      setInbox(list);
      setPros(Array.isArray(s.data) ? s.data : s.data?.providers || []);
      setLoading(false);
    });
  }, []);

  const projectCount = bookings.length + posts.length;
  const offerCount = useMemo(
    () => posts.reduce((sum, p) => sum + (p.pending_quotes || p.quotes?.filter((q) => q.status === "pending").length || 0), 0),
    [posts],
  );
  const activeProjects = useMemo(
    () => bookings.filter((b) => ["pending", "accepted", "in_progress"].includes(b.status)).length,
    [bookings],
  );
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const usedPhotos = new Set();

  const activity = useMemo(() => {
    const items = [];
    for (const post of posts.slice(0, 5)) {
      items.push({
        id: `post-${post.id}`,
        label: `Project posted: ${post.title}`,
        when: post.created_at,
        status: post.status === "open" ? "Active" : post.status || "Active",
        to: `/listings/${post.id}`,
      });
    }
    for (const fav of favorites.slice(0, 3)) {
      items.push({
        id: `fav-${fav.provider_id || fav.id}`,
        label: `Added to favorites: ${fav.business_name || fav.full_name || "Pro"}`,
        when: fav.created_at,
        to: `/providers/${fav.provider_id || fav.id}`,
      });
    }
    for (const msg of inbox.slice(0, 3)) {
      items.push({
        id: `msg-${msg.id}`,
        label: `New message from ${msg.from_name || msg.pro_name || "Pro"}`,
        when: msg.created_at || msg.updated_at,
        to: msg.listing_id ? `/listings/${msg.listing_id}` : "/account/messages",
      });
    }
    return items
      .sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0))
      .slice(0, 6);
  }, [posts, favorites, inbox]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <DashboardShell role="customer">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(105deg,#4F46E5_0%,#7C3AED_48%,#6366F1_100%)] p-6 text-white shadow-[0_24px_56px_rgba(79,70,229,0.28)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 88% 35%, rgba(255,255,255,0.4), transparent 42%), radial-gradient(circle at 8% 85%, rgba(34,211,238,0.22), transparent 38%)",
            }}
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.04em] sm:text-[2rem]">
                Welcome back, {firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/88">
                Let&apos;s get started with your projects, saved items and more.
              </p>
              <form onSubmit={onSearch} className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services, categories or pros…"
                  className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-[14px] text-[#0b1220] shadow-[0_8px_24px_rgba(15,23,42,0.12)] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className={`${press} inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#5b46f5] px-7 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(91,70,245,0.45)]`}
                >
                  Search
                </button>
              </form>
            </div>
            <div className="relative hidden overflow-hidden rounded-2xl ring-1 ring-white/25 sm:block lg:min-h-[200px]">
              <img src="/customer-cta.jpg" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#7C3AED]/15 to-[#4F46E5]/50" />
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className={`${press} flex items-center gap-4 rounded-2xl border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]`}
            >
              <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl ${a.tone}`}>
                <QuickActionGlyph name={a.glyph} className="size-5" />
              </span>
              <span>
                <span className="block text-[14px] font-bold text-[#0b1220]">{a.title}</span>
                <span className="mt-0.5 block text-[12px] text-[#64748b]">{a.desc}</span>
              </span>
            </Link>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold tracking-[-0.02em]">Browse popular categories</h2>
            <Link to="/services" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {DASH_CATS.map((cat) => (
              <Link
                key={cat.slug}
                to={`/search?category=${encodeURIComponent(cat.apiSlug || cat.slug)}`}
                className={`${press} overflow-hidden rounded-2xl border border-[#E7EAF0] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.04)]`}
              >
                <img src={cat.image || `/categories/${cat.slug}.jpg`} alt="" className="aspect-square w-full object-cover" />
                <p className="truncate px-2 py-2 text-center text-[11px] font-bold text-[#334155]">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "My Projects", value: activeProjects, to: "/account/bookings" },
            { label: "My Posts", value: posts.length, to: "/account/posts" },
            { label: "Offers Received", value: offerCount, to: "/account/notifications" },
            { label: "Saved Pros", value: favorites.length, to: "/account/favorites" },
          ].map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className={`${press} rounded-2xl border border-[#E7EAF0] bg-white p-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]`}
            >
              <p className="text-2xl font-bold tracking-[-0.04em]">{loading ? "—" : s.value}</p>
              <p className="mt-1 text-[12px] font-semibold text-[#64748b]">{s.label}</p>
            </Link>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.1rem] font-bold tracking-[-0.02em]">Recent Services</h2>
                <Link to="/search" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {loading && <p className="text-sm text-[#64748b]">Loading…</p>}
              {!loading && pros.length === 0 && (
                <p className="text-sm text-[#64748b]">Browse pros in your area from search.</p>
              )}
              <RecentServicesGrid pros={pros.slice(0, 4)} pressClass={press} />
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.1rem] font-bold tracking-[-0.02em]">Saved Items</h2>
                <Link to="/account/favorites" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {!loading && favorites.length === 0 && (
                <p className="rounded-2xl bg-[#F8FAFC] p-5 text-sm text-[#64748b]">
                  Save pros you like to find them quickly here.
                </p>
              )}
              <ul className="grid grid-cols-3 gap-3">
                {favorites.slice(0, 3).map((fav) => {
                  const img = photoForItem(fav, usedPhotos) || categoryCover(fav);
                  return (
                    <li key={fav.provider_id || fav.id}>
                      <Link to={`/providers/${fav.provider_id || fav.id}`} className={`${press} block`}>
                        <SavedThumb img={img} name={fav.business_name || fav.full_name} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.1rem] font-bold tracking-[-0.02em]">My Activity</h2>
                <Link to="/account/posts" className="text-[13px] font-semibold text-[#5b46f5] hover:underline">
                  View All
                </Link>
              </div>
              {!loading && activity.length === 0 && (
                <p className="rounded-2xl bg-[#F8FAFC] p-5 text-sm text-[#64748b]">
                  Post a project or browse pros to see activity here.
                </p>
              )}
              <ul className="space-y-2.5">
                {activity.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className={`${press} flex items-center justify-between gap-3 rounded-2xl border border-[#EEF2F7] bg-[#F8FAFC] px-4 py-3.5`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0b1220]">{item.label}</p>
                        <p className="mt-0.5 text-[11px] text-[#94A3B8]">{timeAgo(item.when)}</p>
                      </div>
                      {item.status && (
                        <span className="shrink-0 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold text-[#15803D]">
                          {item.status}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <h2 className="text-[1.05rem] font-bold">Your Profile</h2>
              <ProfileBlock name={user?.full_name} email={user?.email} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#F8FAFC] px-2 py-2.5">
                  <p className="text-lg font-bold">{loading ? "—" : projectCount}</p>
                  <p className="text-[10px] font-semibold text-[#64748b]">Projects</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] px-2 py-2.5">
                  <p className="text-lg font-bold">{loading ? "—" : favorites.length}</p>
                  <p className="text-[10px] font-semibold text-[#64748b]">Saved</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] px-2 py-2.5">
                  <p className="text-lg font-bold">{loading ? "—" : completedBookings.length}</p>
                  <p className="text-[10px] font-semibold text-[#64748b]">Reviews</p>
                </div>
              </div>
              <span className="mt-4 inline-flex rounded-full bg-[#EDE9FE] px-3 py-1 text-[11px] font-bold text-[#6D28D9]">
                Verified Customer
              </span>
            </section>

            <section className="rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#6D28D9]">
                  <GlyphHeadset className="size-5" />
                </span>
                <div>
                  <h2 className="text-[1.05rem] font-bold">Need Help?</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                    Our support team is here to help you 24/7.
                  </p>
                </div>
              </div>
              <Link
                to="/info/help-center"
                className={`${press} mt-4 inline-flex w-full items-center justify-center text-[13px] font-bold text-[#5b46f5] hover:underline`}
              >
                Contact Support →
              </Link>
            </section>

            <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0f172a,#5b46f5)] p-5 text-white shadow-[0_16px_40px_rgba(91,70,245,0.35)]">
              <span
                className="inline-flex size-11 items-center justify-center rounded-xl bg-white/15 text-amber-300"
                aria-hidden="true"
              >
                <GlyphCrown className="size-5" />
              </span>
              <p className="mt-3 text-[1.05rem] font-bold">Upgrade to Pro</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/85">
                Earn on SevenPros — unlock leads and grow your business.
              </p>
              <Link
                to="/become-a-pro"
                className={`${press} mt-4 inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13px] font-bold text-[#5b46f5]`}
              >
                Learn More →
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}