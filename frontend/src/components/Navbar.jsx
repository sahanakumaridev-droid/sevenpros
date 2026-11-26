import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import Logo from "./brand/Logo";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { COVERAGE, copy, readLang, readPlace, writeLang, writePlace } from "../lib/coverage";

const GUEST_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/search", label: "Browse Pros" },
  { to: "/services", label: "Services" },
  { to: "/info/how-it-works", label: "How It Works" },
];

const MEMBER_LINKS = [
  ...GUEST_LINKS,
  { to: "/credits", label: "Pricing" },
  { to: "/info/blog", label: "Blog" },
  { to: "/info/contact", label: "Contact" },
];

const press = "transition-transform duration-150 ease-out active:scale-[0.98]";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-[#9aa3b2]">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-[#5b46f5]">
      <path d="M8 14s4.2-3.6 4.2-6.4A4.2 4.2 0 0 0 8 3.4a4.2 4.2 0 0 0-4.2 4.2C3.8 10.4 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="7.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [place, setPlace] = useState(readPlace);
  const [lang, setLang] = useState(readLang);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [inbox, setInbox] = useState({ unread: 0, items: [] });
  const [inboxOpen, setInboxOpen] = useState(false);
  const headerRef = useRef(null);
  const pro = user?.active_mode === "provider";
  const links = (user ? MEMBER_LINKS : GUEST_LINKS).filter((item) => !(pro && item.label === "Browse Pros"));

  const onSwitch = async (mode) => {
    await switchMode(mode);
    navigate(mode === "provider" ? "/pro/dashboard" : "/account/dashboard");
  };

  const onSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setMobileOpen(false);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setPlaceOpen(false);
    setInboxOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return undefined;
    let stop = false;
    const loadInbox = () => {
      client.get("/credits/inbox").then((res) => {
        if (!stop) setInbox(res.data);
      }).catch(() => {});
    };
    loadInbox();
    const timer = setInterval(loadInbox, 15000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [user]);

  const placePanel = placeOpen && (
    <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[#ece8f4] bg-white p-3 text-[#14181d] shadow-[0_16px_40px_rgba(40,30,90,0.12)]">
      <p className="text-xs font-semibold text-[#5c6770]">{copy(lang).location}</p>
      <label className="mt-2 block text-xs font-semibold">{copy(lang).country}
        <select
          value={place.country}
          onChange={(e) => {
            const country = e.target.value;
            const region = Object.keys(COVERAGE[country].regions)[0];
            setPlace(writePlace({ country, region, county: "", city: "" }));
          }}
          className="mt-1 h-10 w-full rounded-xl border border-[#e4e7eb] px-2 text-sm"
        >
          <option value="US">California, USA</option>
          <option value="CA">Canada</option>
        </select>
      </label>
      <label className="mt-2 block text-xs font-semibold">{copy(lang).state}
        <select
          value={place.region}
          onChange={(e) => setPlace(writePlace({ ...place, region: e.target.value, county: "", city: "" }))}
          className="mt-1 h-10 w-full rounded-xl border border-[#e4e7eb] px-2 text-sm"
        >
          {Object.keys(COVERAGE[place.country].regions).map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
      </label>
      <label className="mt-2 block text-xs font-semibold">{copy(lang).county}
        <select
          value={place.county}
          onChange={(e) => setPlace(writePlace({ ...place, county: e.target.value, city: "" }))}
          className="mt-1 h-10 w-full rounded-xl border border-[#e4e7eb] px-2 text-sm"
        >
          <option value="">{copy(lang).allAreas}</option>
          {Object.keys(COVERAGE[place.country].regions[place.region] || {}).map((county) => (
            <option key={county}>{county}</option>
          ))}
        </select>
      </label>
      <label className="mt-2 block text-xs font-semibold">{copy(lang).city}
        <select
          value={place.city}
          onChange={(e) => setPlace(writePlace({ ...place, city: e.target.value }))}
          className="mt-1 h-10 w-full rounded-xl border border-[#e4e7eb] px-2 text-sm"
        >
          <option value="">{copy(lang).allCities}</option>
          {(COVERAGE[place.country].regions[place.region]?.[place.county] || []).map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <div className="mt-3 flex gap-2">
        {["en", "es"].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(writeLang(code))}
            className={`h-9 flex-1 rounded-full text-xs font-semibold ${lang === code ? "bg-[#5b46f5] text-white" : "border border-[#e4e7eb]"}`}
          >
            {code === "en" ? "English" : "Español"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-[#eceaf1] bg-white pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(20,24,29,0.04)]">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo nav />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative inline-flex h-16 items-center text-[14.5px] font-medium tracking-[-0.01em] ${isActive ? "text-[#5b46f5]" : "text-[#2c3342] hover:text-[#14181d]"}`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#5b46f5]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden h-10 min-w-[220px] max-w-[380px] flex-1 items-center gap-2 rounded-full border border-[#e7eaf0] bg-[#f7f8fb] px-3.5 md:flex">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={user ? "Search services..." : "Search for services..."}
            aria-label="Search for services"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#14181d] outline-none placeholder:text-[#98a0ad]"
          />
          {!user && (
            <div className="relative flex items-center">
              <span className="mr-1 h-5 w-px bg-[#ece8f4]" />
              <button type="button" onClick={() => setPlaceOpen((open) => !open)} aria-label="Choose location" aria-expanded={placeOpen} className={`grid size-8 place-items-center rounded-full ${press}`}>
                <PinIcon />
              </button>
              {placePanel}
            </div>
          )}
        </form>

        {user && (
          <div className="relative hidden md:block">
            <button type="button" onClick={() => setPlaceOpen((open) => !open)} aria-label="Choose location" aria-expanded={placeOpen} className={`grid size-10 place-items-center rounded-full border border-[#e7eaf0] bg-[#f7f8fb] ${press}`}>
              <PinIcon />
            </button>
            {placePanel}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {user && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                aria-label={pro ? "Leads" : "Messages"}
                aria-expanded={inboxOpen}
                onClick={() => setInboxOpen((open) => !open)}
                className={`relative grid size-10 place-items-center rounded-full text-[#5c6578] hover:bg-[#f6f4ff] ${press}`}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2.2a4.2 4.2 0 0 1 4.2 4.6c0 2.4-.7 3.6-1.3 4.4H6.1C5.5 10.4 4.8 9.2 4.8 6.8A4.2 4.2 0 0 1 9 2.2Z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M7.2 13.2a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {inbox.unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-[#e11d48]" />}
              </button>
              {inboxOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-[#eceff2] bg-white p-2 text-[#14181d] shadow-[0_16px_40px_rgba(15,23,32,0.12)]">
                  <div className="flex items-center justify-between px-2 py-2">
                    <p className="text-sm font-semibold">{pro ? "Leads" : "Messages"}</p>
                    <Link to={pro ? "/pro/leads" : "/account/posts"} className="text-xs font-semibold text-[#5b46f5]" onClick={() => setInboxOpen(false)}>
                      {pro ? "All leads" : "My posts"}
                    </Link>
                  </div>
                  {inbox.items.length === 0 && <p className="px-2 py-3 text-sm text-[#5c6770]">No messages yet.</p>}
                  {inbox.items.map((item) => (
                    <Link key={item.job_id} to={`/listings/${item.job_id}`} onClick={() => setInboxOpen(false)} className="block rounded-xl px-2 py-2 hover:bg-[#f6f4ff]">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{item.unread ? item.from_name : item.title}</span>
                        {item.unread && <span className="size-2 shrink-0 rounded-full bg-[#e11d48]" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#5c6770]">{item.mine ? "You: " : `${item.from_name}: `}{item.body}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {user && (
            <Link to="/post" className={`hidden h-10 items-center gap-1 rounded-full bg-[#efe9ff] px-3.5 text-sm font-semibold text-[#5b46f5] sm:inline-flex ${press}`}>
              <span aria-hidden="true">+</span> Post
            </Link>
          )}

          {!user && (
            <Link to="/login" className={`hidden h-10 items-center rounded-full border border-[#dfe3ea] bg-white px-[18px] text-[14px] font-semibold text-[#1c2130] sm:inline-flex ${press}`}>
              Sign In
            </Link>
          )}

          {!pro && (
            <Link
              to={user ? "/become-a-pro" : "/signup"}
              className={`hidden h-10 items-center rounded-full bg-[linear-gradient(100deg,#6a4bff_0%,#4f6bff_55%,#3b82f6_100%)] px-[18px] text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(79,70,229,0.28)] md:inline-flex ${press}`}
            >
              Get Started
            </Link>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
                className={`inline-flex h-10 items-center gap-1 rounded-full border border-[#ece7fb] bg-white pl-1 pr-2 ${press}`}
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#f4f1ff] text-sm font-semibold text-[#5b46f5]">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-[#6b7280]">
                  <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#eceff2] bg-white py-2 text-sm text-[#14181d] shadow-[0_16px_40px_rgba(15,23,32,0.12)]">
                  <div className="border-b border-[#eceff2] px-4 py-2 text-[#5c6770]">{user.full_name}</div>
                  {user.is_provider && (
                    <div className="border-b border-[#eceff2] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onSwitch(pro ? "customer" : "provider")}
                        className="h-9 w-full rounded-full border border-[#e4e7eb] text-[13px] font-semibold"
                      >
                        {pro ? "Switch to customer" : "Switch to pro"}
                      </button>
                    </div>
                  )}
                  {pro ? (
                    <>
                      <Link to="/post" className="block px-4 py-2 hover:bg-[#f4f6f8]">Post</Link>
                      <Link to="/pro/dashboard" className="block px-4 py-2 hover:bg-[#f4f6f8]">Dashboard</Link>
                      <Link to="/pro/leads" className="block px-4 py-2 hover:bg-[#f4f6f8]">Leads</Link>
                      <Link to="/credits" className="block px-4 py-2 hover:bg-[#f4f6f8]">Pricing</Link>
                      <Link to="/pro/services" className="block px-4 py-2 hover:bg-[#f4f6f8]">My services</Link>
                      <Link to="/account/posts" className="block px-4 py-2 hover:bg-[#f4f6f8]">My posts</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account/posts" className="block px-4 py-2 hover:bg-[#f4f6f8]">My posts</Link>
                      <Link to="/account/bookings" className="block px-4 py-2 hover:bg-[#f4f6f8]">My bookings</Link>
                      <Link to="/credits" className="block px-4 py-2 hover:bg-[#f4f6f8]">Pricing</Link>
                      <Link to="/account/profile" className="block px-4 py-2 hover:bg-[#f4f6f8]">Settings</Link>
                    </>
                  )}
                  <button type="button" onClick={logout} className="w-full px-4 py-2 text-left text-[#9a3412] hover:bg-[#f4f6f8]">
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-[#14181d] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#f2f0f7] bg-white lg:hidden">
          <nav className="container-page flex max-h-[calc(100dvh-4.5rem)] flex-col gap-1 overflow-y-auto py-3 pb-[max(1rem,env(safe-area-inset-bottom))]" aria-label="Mobile">
            <form onSubmit={onSearch} className="mb-2 flex h-11 items-center gap-2 rounded-full border border-[#ece7fb] px-3">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={user ? "Search services..." : "Search for services..."}
                aria-label="Search for services"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </form>
            {links.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-medium text-[#14181d]">
                {item.label}
              </Link>
            ))}
            <div className="px-1 py-2">
              <CategoryMegaMenu variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 px-1">
              {user ? (
                <Link to="/post" onClick={() => setMobileOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-[#efe9ff] text-sm font-semibold text-[#5b46f5]">
                  Post
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex h-12 items-center justify-center rounded-full border border-[#e6e3f2] text-sm font-semibold text-[#14181d]">
                  Sign In
                </Link>
              )}
              {!pro && (
                <Link
                  to={user ? "/become-a-pro" : "/signup"}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 items-center justify-center rounded-full bg-[linear-gradient(90deg,#5b46f5,#3b78f6)] text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
