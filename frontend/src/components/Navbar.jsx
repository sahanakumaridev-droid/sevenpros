import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./brand/Logo";
import Button from "./ui/Button";
import CategoryMegaMenu from "./CategoryMegaMenu";

const LINKS = [
  { to: "/search", label: "Find a Pro" },
  { to: "/search", label: "Categories", mega: true },
  { to: "/info/how-it-works", label: "How It Works" },
  { to: "/become-a-pro", label: "For Pros" },
  { to: "/info/about", label: "About" },
];

const navItemClassDark =
  "px-3 h-10 rounded-lg text-[12px] font-semibold tracking-[0.12em] uppercase text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center gap-1.5";
const navItemClassLight =
  "px-3 h-10 rounded-lg text-[13px] font-semibold text-navy/70 hover:text-navy hover:bg-[#F0F5FB] inline-flex items-center gap-1.5";

export default function Navbar({ overlay = false, light = false }) {
  const { user, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  const onSwitch = async (mode) => {
    await switchMode(mode);
    navigate(mode === "provider" ? "/pro/dashboard" : "/");
  };

  useEffect(() => {
    if (!catOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setCatOpen(false);
    };
    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [catOpen]);

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

  const navItemClass = light ? navItemClassLight : navItemClassDark;

  return (
    <header
      ref={headerRef}
      className={`z-40 pt-[env(safe-area-inset-top)] ${
        overlay
          ? "absolute top-0 inset-x-0 bg-transparent"
          : light
            ? "sticky top-0 bg-white border-b border-[#E6EEF7]"
            : "sticky top-0 bg-navy border-b border-white/10"
      }`}
    >
      <div className="container-page flex items-center gap-2 sm:gap-5 h-16 sm:h-[72px] md:h-20">
        <Logo compact tone={light ? "light" : "dark"} />

        <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Primary">
          {LINKS.map((item) =>
            item.mega ? (
              <button
                key={item.label}
                type="button"
                aria-expanded={catOpen}
                aria-haspopup="true"
                onClick={() => setCatOpen((o) => !o)}
                className={`${navItemClass} ${catOpen ? "bg-white/10 text-white" : ""}`}
              >
                {item.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `${navItemClass} ${light && isActive ? "!text-blue relative after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-blue after:rounded-full" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div
            className={`hidden md:flex items-center gap-1.5 rounded-full px-3 h-9 text-xs font-medium ${
              light ? "bg-[#F0F5FB] text-navy" : "bg-white/10 text-white"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="#00AEEF" strokeWidth="2" />
              <circle cx="12" cy="10" r="2.2" fill="#00AEEF" />
            </svg>
            California, USA
          </div>

          {light && (
            <button
              type="button"
              className="hidden sm:grid size-9 place-items-center rounded-full bg-[#F0F5FB] text-navy relative"
              aria-label="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 9a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9zM10 20a2 2 0 004 0"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-[#E11D48] text-white text-[9px] font-bold leading-4 text-center">
                3
              </span>
            </button>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className={`hidden sm:inline text-sm font-medium px-2 ${
                  light ? "text-navy/80 hover:text-navy" : "text-white/90 hover:text-white"
                }`}
              >
                Sign In
              </Link>
              <span className="max-sm:hidden">
                {light ? (
                  <Button to="/become-a-pro" className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-[13px] sm:text-sm">
                    List Your Business
                  </Button>
                ) : (
                  <Button to="/signup" className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-[13px] sm:text-sm">
                    Get Started
                  </Button>
                )}
              </span>
            </>
          )}

          {user && !user.is_provider && (
            <span className="max-md:hidden">
              <Button to="/become-a-pro" variant="outline" className="h-10 rounded-xl">
                Become a Pro
              </Button>
            </span>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                aria-label="Account menu"
                className="size-9 rounded-full bg-brand-grad text-white flex items-center justify-center font-semibold text-sm"
              >
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </button>
              {menuOpen && (
                <div className="popover-panel-right absolute right-0 mt-2 w-56 bg-white text-navy border border-[#E6EEF7] rounded-xl py-2 text-sm shadow-xl">
                  <div className="px-4 py-2 text-slate border-b border-[#E6EEF7]">{user.full_name}</div>
                  {user.is_provider && (
                    <div className="px-4 py-2 border-b border-[#E6EEF7]">
                      <button
                        type="button"
                        onClick={() => onSwitch(user.active_mode === "provider" ? "customer" : "provider")}
                        className="w-full text-center border border-navy rounded-lg py-1.5 font-semibold"
                      >
                        {user.active_mode === "provider" ? "Switch to Customer" : "Switch to Pro"}
                      </button>
                    </div>
                  )}
                  {user.active_mode === "provider" ? (
                    <>
                      <Link to="/pro/dashboard" className="block px-4 py-2 hover:bg-[#F5F8FC]">Dashboard</Link>
                      <Link to="/pro/services" className="block px-4 py-2 hover:bg-[#F5F8FC]">My Services</Link>
                      <Link to="/pro/bookings" className="block px-4 py-2 hover:bg-[#F5F8FC]">Bookings</Link>
                      <Link to="/pro/profile" className="block px-4 py-2 hover:bg-[#F5F8FC]">Business Profile</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account/bookings" className="block px-4 py-2 hover:bg-[#F5F8FC]">My Bookings</Link>
                      <Link to="/account/favorites" className="block px-4 py-2 hover:bg-[#F5F8FC]">Favorites</Link>
                      <Link to="/account/profile" className="block px-4 py-2 hover:bg-[#F5F8FC]">Settings</Link>
                    </>
                  )}
                  <button type="button" onClick={logout} className="w-full text-left px-4 py-2 text-danger hover:bg-[#F5F8FC]">
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className={`lg:hidden size-11 shrink-0 rounded-lg ${light ? "text-navy hover:bg-[#F0F5FB]" : "text-white hover:bg-white/10"}`}
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
          <div className="container-page pt-2 pb-4">
            <CategoryMegaMenu onNavigate={() => setCatOpen(false)} />
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className={`lg:hidden border-t max-h-[calc(100dvh-4rem)] overflow-y-auto ${light ? "border-[#E6EEF7] bg-white" : "border-white/10 bg-navy/95 backdrop-blur-md"}`}>
          <nav className="container-page py-3 flex flex-col gap-1 pb-[max(1rem,env(safe-area-inset-bottom))]" aria-label="Mobile">
            {LINKS.map((item) =>
              item.mega ? (
                <div key={item.label}>
                  <p className={`px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${light ? "text-slate" : "text-white/50"}`}>
                    {item.label}
                  </p>
                  <CategoryMegaMenu variant="mobile" onNavigate={() => setMobileOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 min-h-12 flex items-center rounded-lg font-semibold tracking-[0.12em] uppercase text-[13px] ${
                    light ? "text-navy hover:bg-[#F0F5FB]" : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className={`flex items-center gap-2 px-3 py-3 text-sm ${light ? "text-navy/70" : "text-white/80"}`}>
              California, USA
            </div>
            {!user && (
              <div className="flex gap-2 px-3 pt-2">
                <Button to="/login" variant="outline" className="flex-1 min-h-12" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Button>
                <Button to="/signup" className="flex-1 min-h-12" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
