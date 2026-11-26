import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import { readPlace, shortPlace } from "../lib/coverage";
import Logo from "./brand/Logo";
import Button from "./ui/Button";
import CategoryMegaMenu, { prefetchCategories } from "./CategoryMegaMenu";
import LocationPicker from "./home/LocationPicker";

const LINKS = [
  { to: "/search", label: "Find a Pro" },
  { to: "/search", label: "Categories", mega: true },
  { to: "/info/how-it-works", label: "How It Works" },
  { to: "/info/about", label: "About" },
];

export default function LandingNavbar({ overlay: _overlay = true, light: _light = false }) {
  const { user, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [place, setPlace] = useState(readPlace);
  const [inbox, setInbox] = useState({ unread: 0, pending_quotes: 0 });
  const headerRef = useRef(null);
  const isPro = user?.active_mode === "provider";
  const onAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/get-started";

  useEffect(() => {
    const onPlace = () => setPlace(readPlace());
    window.addEventListener("sevenpros-place", onPlace);
    return () => window.removeEventListener("sevenpros-place", onPlace);
  }, []);

  useEffect(() => {
    prefetchCategories();
  }, []);

  useEffect(() => {
    if (!user) {
      setInbox({ unread: 0, pending_quotes: 0 });
      return undefined;
    }
    let alive = true;
    const pull = () => {
      client
        .get("/credits/inbox")
        .then((res) => {
          if (alive) setInbox({ unread: res.data.unread || 0, pending_quotes: res.data.pending_quotes || 0 });
        })
        .catch(() => {});
    };
    pull();
    const timer = setInterval(pull, 20000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [user]);

  const openLocation = () => {
    setCatOpen(false);
    setMenuOpen(false);
    setMobileOpen(false);
    setLocationOpen(true);
  };

  const onSwitch = async (mode) => {
    await switchMode(mode);
    navigate(mode === "provider" ? "/pro/dashboard" : "/account/dashboard");
  };

  useEffect(() => {
    if (!catOpen && !menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setCatOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) {
        setCatOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [catOpen, menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
      else setCatOpen(false);
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

  // ClickTrack-style dark menu: solid navy, white caps, Montserrat
  const menuBg = "sticky top-0 inset-x-0 bg-[#0B1120] border-b border-white/10";
  const linkClass =
    "px-3 h-9 rounded-md font-display text-[12px] font-bold uppercase tracking-[0.12em] text-white hover:text-[#7ec8f5] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150";
  const linkActive = "text-[#7ec8f5]";
  const outlineCta =
    "hidden md:inline-flex h-9 items-center justify-center rounded-md border border-[#7ec8f5]/70 bg-transparent px-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white/5 active:scale-[0.97] transition-[transform,background-color] duration-150 whitespace-nowrap";
  const solidCta =
    "h-9 gap-1.5 px-5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-display text-[12px] font-bold uppercase tracking-[0.1em] shadow-none whitespace-nowrap active:scale-[0.97] transition-[transform,background-color] duration-150";
  const userActionLink =
    "hidden sm:inline-flex h-9 shrink-0 items-center rounded-md px-2.5 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-white hover:text-[#7ec8f5] whitespace-nowrap transition-colors duration-150";

  return (
    <header ref={headerRef} className={`z-50 overflow-visible pt-[env(safe-area-inset-top)] ${menuBg}`}>
      <div className="relative mx-auto flex h-16 w-full max-w-[1600px] items-center gap-2 px-4 sm:h-[68px] sm:gap-3 sm:px-5 md:h-20 lg:px-6">
        <Logo compact showTagline={false} tone="dark" />

        <nav className="hidden min-w-0 shrink-0 lg:flex items-center gap-0.5 ml-2 xl:ml-4 whitespace-nowrap" aria-label="Primary">
          {LINKS.map((item) =>
            item.mega ? (
              <button
                key={item.label}
                type="button"
                aria-expanded={catOpen}
                aria-haspopup="true"
                onClick={() => {
                  setMenuOpen(false);
                  setCatOpen((o) => !o);
                }}
                className={`${linkClass} ${catOpen ? linkActive : ""}`}
              >
                {item.label}
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`opacity-80 transition-transform duration-200 ease-out ${catOpen ? "rotate-180" : ""}`}>
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setCatOpen(false)}
                className={({ isActive }) => `${linkClass} ${isActive ? linkActive : ""}`}
              >
                {item.label}
              </NavLink>
            ),
          )}
          <button
            type="button"
            onClick={openLocation}
            aria-haspopup="dialog"
            className={`${linkClass} ${locationOpen ? linkActive : ""}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="10" r="2.2" fill="currentColor" />
            </svg>
            Location
            <span className="max-w-[7rem] truncate text-[10px] font-semibold normal-case tracking-normal text-white/55">
              {shortPlace(place)}
            </span>
          </button>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {!user && !onAuthPage && (
            <>
              <Link to="/services/customer" className={outlineCta}>
                Customer
              </Link>
              <Link
                to="/services/pro"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md px-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 hover:text-white whitespace-nowrap"
              >
                Pro
              </Link>
              <span className="max-sm:hidden">
                <Button to="/get-started" className={solidCta}>
                  Get Started <span aria-hidden="true">→</span>
                </Button>
              </span>
            </>
          )}
          {!user && onAuthPage && (
              <Link
                to="/get-started?mode=signin"
                className="hidden sm:inline font-display text-[12px] font-bold uppercase tracking-[0.12em] text-white/80 hover:text-white"
              >
                Sign in
              </Link>
          )}

          {user && (
            <>
              <Link to="/post" className={userActionLink}>
                Post
              </Link>
              <Link
                to={isPro ? "/pro/leads" : "/account/posts"}
                className={`${userActionLink} gap-1.5`}
              >
                {isPro ? "Leads" : "My posts"}
                {(inbox.unread > 0 || inbox.pending_quotes > 0) && (
                  <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-[#2563eb] text-[9px] font-bold leading-none text-white">
                    {Math.min(9, inbox.unread || inbox.pending_quotes)}
                  </span>
                )}
              </Link>
              <div className="relative z-[60] flex items-center">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  className="relative flex size-9 items-center justify-center rounded-full bg-brand-grad text-sm font-semibold text-white"
                >
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                  {inbox.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#60a5fa] ring-2 ring-[#0B1120]" />
                  )}
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-56 rounded-xl border border-[#E6EEF7] bg-white py-2 text-sm text-navy shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
                  >
                    <div className="border-b border-[#E6EEF7] px-4 py-2 text-slate">{user.full_name}</div>
                    {user.is_provider && (
                      <div className="border-b border-[#E6EEF7] px-4 py-2">
                        <button
                          type="button"
                          onClick={() => onSwitch(isPro ? "customer" : "provider")}
                          className="w-full rounded-lg border border-navy py-1.5 text-center font-semibold"
                        >
                          {isPro ? "Switch to Customer" : "Switch to Pro"}
                        </button>
                      </div>
                    )}
                    {isPro ? (
                      <>
                        <Link to="/pro/leads" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Leads</Link>
                        <Link to="/post" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Post</Link>
                        <Link to="/credits" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Credits & Pro</Link>
                        <Link to="/pro/dashboard" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Dashboard</Link>
                        <Link to="/pro/services" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">My Services</Link>
                        <Link to="/pro/bookings" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Bookings</Link>
                        <Link to="/pro/profile" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Business Profile</Link>
                      </>
                    ) : (
                      <>
                        {!user.is_provider && <Link to="/become-a-pro" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Become a Pro</Link>}
                        <Link to="/account/dashboard" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Dashboard</Link>
                        <Link to="/account/posts" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">
                          My Posts{inbox.pending_quotes ? ` (${inbox.pending_quotes})` : ""}
                        </Link>
                        <Link to="/account/bookings" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">My Bookings</Link>
                        <Link to="/credits" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Credits</Link>
                        <Link to="/account/favorites" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Favorites</Link>
                        <Link to="/account/profile" role="menuitem" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-[#F5F8FC]">Settings</Link>
                      </>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left font-semibold text-[#9a3412] hover:bg-[#F5F8FC]"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            className="lg:hidden size-11 shrink-0 rounded-md text-white hover:bg-white/10"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {catOpen && (
        <div className="hidden lg:block absolute inset-x-0 top-full z-50">
          <div className="mx-auto w-full max-w-[1600px] px-4 pt-2 pb-4 sm:px-5 lg:px-6">
            <CategoryMegaMenu onNavigate={() => setCatOpen(false)} />
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-[#0B1120]">
          <nav className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5" aria-label="Mobile">
            {LINKS.map((item) =>
              item.mega ? (
                <div key={item.label}>
                  <p className="px-3 pt-2 pb-1 font-display text-[11px] font-bold tracking-[0.14em] uppercase text-white/55">
                    {item.label}
                  </p>
                  <CategoryMegaMenu variant="mobile" darkMobile onNavigate={() => setMobileOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 min-h-12 flex items-center rounded-md font-display text-[13px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ),
            )}
            <button
              type="button"
              onClick={openLocation}
              className="px-3 min-h-12 flex items-center justify-between gap-3 rounded-md font-display text-[13px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="10" r="2.2" fill="currentColor" />
                </svg>
                Location
              </span>
              <span className="text-[12px] font-semibold normal-case tracking-normal text-white/55">{shortPlace(place)}</span>
            </button>
            {!user ? (
              <div className="flex flex-col gap-2 px-3 pt-3">
                {!onAuthPage ? (
                  <>
                    <Link
                      to="/services/customer"
                      onClick={() => setMobileOpen(false)}
                      className="min-h-12 rounded-md border border-[#7ec8f5]/70 text-center font-display text-[12px] font-bold uppercase tracking-[0.12em] leading-[2.75rem] text-white"
                    >
                      Customer
                    </Link>
                    <Link
                      to="/services/pro"
                      onClick={() => setMobileOpen(false)}
                      className="min-h-12 rounded-md text-center font-display text-[12px] font-bold uppercase tracking-[0.12em] leading-[2.75rem] text-white/90"
                    >
                      Pro
                    </Link>
                    <Button to="/get-started" className="min-h-12 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] font-display text-[12px] font-bold uppercase tracking-[0.1em] shadow-none" onClick={() => setMobileOpen(false)}>
                      Get Started →
                    </Button>
                  </>
                ) : (
                    <Link
                      to="/get-started?mode=signin"
                      onClick={() => setMobileOpen(false)}
                      className="min-h-12 flex items-center justify-center rounded-md border border-[#7ec8f5]/70 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-white"
                    >
                      Sign in
                    </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-3 pt-3">
                <p className="px-1 pb-2 text-[13px] font-semibold text-white/70">{user.full_name}</p>
                <Link to="/account/profile" onClick={() => setMobileOpen(false)} className="min-h-12 flex items-center rounded-md px-3 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10">
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-12 rounded-md px-3 text-left text-[15px] font-semibold text-[#fca5a5] hover:bg-white/10"
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {locationOpen && (
        <LocationPicker
          place={place}
          onClose={() => setLocationOpen(false)}
          onApply={() => navigate("/search")}
        />
      )}
    </header>
  );
}
