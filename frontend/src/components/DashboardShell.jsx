import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { readPlace, shortPlace } from "../lib/coverage";
import LocationPicker from "./home/LocationPicker";
import Logo from "./brand/Logo";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

const CUSTOMER_NAV_MAIN = [
  { to: "/account/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/search", label: "Find a Pro", icon: "search" },
  { to: "/post", label: "Post a Project", icon: "plus" },
  { to: "/account/bookings", label: "My Projects", icon: "folder" },
  { to: "/account/favorites", label: "Saved Pros", icon: "heart" },
  { to: "/account/messages", label: "Messages", icon: "chat", badgeKey: "messages" },
  { to: "/account/notifications", label: "Notifications", icon: "bolt", badgeKey: "notifications" },
  { to: "/account/payments", label: "Payments", icon: "coin" },
  { to: "/account/profile", label: "Settings", icon: "gear" },
];

const CUSTOMER_NAV_SECONDARY = [
  { to: "/info/help-center", label: "Help & Support", icon: "help" },
];

const CUSTOMER_TOP_LINKS = [
  { to: "/search", label: "Find a Pro" },
  { to: "/services", label: "Categories" },
  { to: "/info/how-it-works", label: "How It Works" },
  { to: "/info/trust-safety", label: "About" },
];

const PRO_NAV_MAIN = [
  { to: "/pro/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/pro/analytics", label: "Analytics", icon: "chart" },
  { to: "/pro/users", label: "User Management", icon: "users" },
  { to: "/pro/projects", label: "Projects", icon: "folder" },
  { to: "/pro/subscription", label: "Subscription Plans", icon: "layers" },
  { to: "/pro/payments", label: "Payments & Billing", icon: "coin" },
  { to: "/pro/reports", label: "Reports", icon: "doc" },
  { to: "/pro/notifications", label: "Notifications", icon: "bolt", badgeKey: "notifications" },
  { to: "/pro/profile", label: "Profile", icon: "user" },
  { to: "/pro/settings", label: "Settings", icon: "gear" },
];

const PRO_NAV_SECONDARY = [
  { to: "/pro/leads", label: "Find Jobs", icon: "search", badgeKey: "leads" },
  { to: "/pro/bookings", label: "My Jobs", icon: "briefcase" },
  { to: "/pro/messages", label: "Messages", icon: "chat", badgeKey: "messages" },
  { to: "/pro/services", label: "Availability", icon: "calendar" },
  { to: "/info/help-center", label: "Help & Support", icon: "help" },
];

const PRO_TOP_LINKS = [
  { to: "/pro/dashboard", label: "Dashboard" },
  { to: "/pro/analytics", label: "Analytics" },
  { to: "/pro/projects", label: "Projects" },
  { to: "/pro/leads", label: "Find Jobs" },
  { to: "/pro/payments", label: "Payments" },
  { to: "/pro/reports", label: "Reports" },
  { to: "/pro/profile", label: "Profile" },
  { to: "/info/help-center", label: "Help" },
];

function NavIcon({ name }) {
  const common = "stroke-current";
  switch (name) {
    case "grid":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" className={common} strokeWidth="1.5" />
          <rect x="10.5" y="2.5" width="5" height="5" rx="1.2" className={common} strokeWidth="1.5" />
          <rect x="2.5" y="10.5" width="5" height="5" rx="1.2" className={common} strokeWidth="1.5" />
          <rect x="10.5" y="10.5" width="5" height="5" rx="1.2" className={common} strokeWidth="1.5" />
        </svg>
      );
    case "search":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="4.5" className={common} strokeWidth="1.5" />
          <path d="M11.5 11.5 15 15" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "plus":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 3.5v11M3.5 9h11" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "folder":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2.5 5.5h4l1.5 1.5H15.5v7.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-8Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "doc":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M5 2.5h5.5L14.5 6.5V14.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10.5 2.5V6.5H14.5" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "heart":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 14.5s-5.5-3.3-5.5-7A3.2 3.2 0 0 1 9 5.2 3.2 3.2 0 0 1 14.5 7.5c0 3.7-5.5 7-5.5 7Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "coin":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" className={common} strokeWidth="1.5" />
          <path d="M9 5.5v7M7 7.2c.5-.7 1.2-1 2-1s1.6.4 1.6 1.2c0 1.6-3.6 1-3.6 2.8 0 .8.7 1.3 2 1.3s1.5-.3 2-.9" className={common} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "gear":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="2.2" className={common} strokeWidth="1.5" />
          <path d="M9 2.5v1.8M9 13.7v1.8M2.5 9h1.8M13.7 9h1.8M4.2 4.2l1.3 1.3M12.5 12.5l1.3 1.3M13.8 4.2l-1.3 1.3M5.5 12.5l-1.3 1.3" className={common} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "bolt":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9.5 2.5 4 10h5l-.5 5.5L14 8H9l.5-5.5Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "briefcase":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2.5" y="5.5" width="13" height="9.5" rx="1.5" className={common} strokeWidth="1.5" />
          <path d="M6.5 5.5V4.2a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v1.3" className={common} strokeWidth="1.5" />
        </svg>
      );
    case "wrench":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M11.5 3.5a3.5 3.5 0 0 0-4.2 4.2L3.5 11.5v3h3l3.8-3.8a3.5 3.5 0 0 0 4.2-4.2L12.5 8.5 11.5 7.5 9.5 5.5l2-2Z" className={common} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "user":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="6.5" r="2.8" className={common} strokeWidth="1.5" />
          <path d="M3.5 15c0-2.8 2.4-4.5 5.5-4.5s5.5 1.7 5.5 4.5" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "chat":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 4.5h12a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H6.5L3 15.5V5.5a1 1 0 0 1 1-1Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2.5 10.8 7H15.5l-3.8 2.8 1.5 4.7L9 12.2 5.8 14.5l1.5-4.7L3.5 7h4.7L9 2.5Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2.5" y="4" width="13" height="11.5" rx="1.5" className={common} strokeWidth="1.5" />
          <path d="M2.5 7h13M6 2.5v3M12 2.5v3" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "help":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6.5" className={common} strokeWidth="1.5" />
          <path d="M7 7a2.2 2.2 0 1 1 3.6 1.7c-.7.5-1.1 1.1-1.1 2M9 13.2h.01" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 14V8M7.5 14V4M12 14v-6M16.5 14v-9" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="6" r="2.5" className={common} strokeWidth="1.5" />
          <circle cx="12.5" cy="7" r="2" className={common} strokeWidth="1.5" />
          <path d="M2 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M10 15c.3-2.2 1.8-3.5 3.5-3.5S16.5 12.5 16.5 15" className={common} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "layers":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 3 3 6.5 9 10l6-3.5L9 3Z" className={common} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m3 9 6 3.5 6-3.5M3 12.5 9 16l6-3.5" className={common} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * @param {{ role: "customer" | "pro", title?: string, children: import("react").ReactNode }} props
 */
export default function DashboardShell({ role = "customer", title, children }) {
  const { user, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [place, setPlace] = useState(readPlace);
  const [inbox, setInbox] = useState({ unread: 0, pending_quotes: 0 });
  const [search, setSearch] = useState("");

  const isPro = role === "pro";
  const nav = isPro ? PRO_NAV_MAIN : CUSTOMER_NAV_MAIN;
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const displayName = user?.full_name || "Account";
  const initial = (user?.full_name || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const onPlace = () => setPlace(readPlace());
    window.addEventListener("sevenpros-place", onPlace);
    return () => window.removeEventListener("sevenpros-place", onPlace);
  }, []);

  useEffect(() => {
    client
      .get("/credits/inbox")
      .then((res) => setInbox(res.data || { unread: 0, pending_quotes: 0 }))
      .catch(() => {});
  }, []);

  const onSwitch = async () => {
    if (!user?.is_provider && isPro === false) {
      navigate("/become-a-pro");
      return;
    }
    const next = isPro ? "customer" : "provider";
    await switchMode(next);
    navigate(next === "provider" ? "/pro/dashboard" : "/account/dashboard");
  };

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (isPro) navigate(q ? `/pro/leads?q=${encodeURIComponent(q)}` : "/pro/leads");
    else navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const inboxCount = (inbox.unread || 0) + (inbox.pending_quotes || 0);

  const badgeFor = (item) => {
    if (item.badgeKey === "leads") return inbox.pending_quotes || 0;
    if (item.badgeKey === "messages") return inbox.unread || 0;
    if (item.badgeKey === "notifications") return (inbox.pending_quotes || 0) + (inbox.unread || 0);
    return 0;
  };

  const customerNotifCount = inbox.pending_quotes || 0;
  const customerInboxTotal = (inbox.unread || 0) + customerNotifCount;

  const Sidebar = (
    <aside className="flex h-full w-[260px] flex-col bg-[#0B1120] text-white">
      <div className="px-5 pt-5 pb-4">
        <Logo compact showTagline={false} tone="dark" />
      </div>

      {!isPro && user && (
        <div className="mx-3 mb-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="truncate text-[13px] font-bold text-white">{displayName}</p>
          <p className="truncate text-[11px] text-white/55">{user.email}</p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label={isPro ? "Pro" : "Customer"}>
        {nav.map((item) => {
          const badge = badgeFor(item);
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              end={item.to === "/pro/dashboard" || item.to === "/account/dashboard"}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold ${
                  isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <span className="opacity-90">
                <NavIcon name={item.icon} />
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {badge > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </NavLink>
          );
        })}
        {!isPro && (
          <>
            <div className="my-3 border-t border-white/10" />
            {CUSTOMER_NAV_SECONDARY.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold ${
                    isActive ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`
                }
              >
                <span className="opacity-85">
                  <NavIcon name={item.icon} />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
        {isPro && (
          <>
            <div className="my-3 border-t border-white/10" />
            {PRO_NAV_SECONDARY.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold ${
                    isActive ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`
                }
              >
                <span className="opacity-85">
                  <NavIcon name={item.icon} />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto space-y-3 px-3 pb-5">
        {user?.is_provider && (
          <button
            type="button"
            onClick={onSwitch}
            className={`${press} w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-[12px] font-semibold text-white/80 hover:bg-white/10`}
          >
            Switch to {isPro ? "Customer" : "Pro"} mode
          </button>
        )}
        {!user?.is_provider && !isPro && (
          <Link
            to="/become-a-pro"
            className={`${press} block rounded-2xl bg-[linear-gradient(135deg,#5b46f5,#7c3aed)] p-4 shadow-[0_12px_28px_rgba(91,70,245,0.35)]`}
          >
            <p className="text-[13px] font-bold text-white">Go Pro</p>
            <p className="mt-1 text-[11px] leading-snug text-white/80">Earn more with verified local jobs.</p>
            <span className="mt-3 inline-flex text-[11px] font-bold text-white/95">Upgrade Now →</span>
          </Link>
        )}
        {isPro && (
          <Link
            to="/credits"
            className={`${press} block rounded-2xl bg-[linear-gradient(135deg,#5b46f5,#7c3aed)] p-4 shadow-[0_12px_28px_rgba(91,70,245,0.35)]`}
          >
            <p className="text-[13px] font-bold text-white">Go Pro</p>
            <p className="mt-1 text-[11px] leading-snug text-white/80">Grow your business with more leads.</p>
            <span className="mt-3 inline-flex text-[11px] font-bold text-white/95">Upgrade Now →</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          className={`${press} w-full rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-white/50 hover:text-white`}
        >
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-dvh bg-[#F4F6FA] text-[#0b1220]">
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shrink-0">{Sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E7EAF0] bg-white/90 backdrop-blur-md">
          <div className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:h-16 lg:flex-nowrap lg:py-0">
            <nav
              className="hidden min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 text-[13px] font-semibold text-[#475569] xl:flex"
              aria-label={isPro ? "Pro shortcuts" : "Browse"}
            >
              {(isPro ? PRO_TOP_LINKS : CUSTOMER_TOP_LINKS).map((item) => (
                <Link key={item.label} to={item.to} className="inline-flex h-9 items-center hover:text-[#5b46f5]">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex w-full min-w-0 flex-1 items-center gap-3 lg:w-auto lg:flex-[1.4]">
          <button
            type="button"
            className={`${press} inline-flex size-10 items-center justify-center rounded-xl border border-[#E7EAF0] lg:hidden`}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <form onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              <NavIcon name="search" />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isPro ? "Search jobs…" : "Search professionals…"}
              className="h-11 w-full rounded-xl border border-[#E7EAF0] bg-[#F8FAFC] pl-10 pr-3 text-[14px] outline-none placeholder:text-[#94A3B8] focus:border-[#5b46f5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,70,245,0.12)]"
            />
          </form>

          <button
            type="button"
            onClick={() => setLocOpen(true)}
            className={`${press} hidden h-11 items-center gap-2 rounded-xl border border-[#E7EAF0] bg-white px-3 text-[13px] font-semibold text-[#334155] sm:inline-flex`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 14s5-4.2 5-7.5a5 5 0 1 0-10 0C3 9.8 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8" cy="6.5" r="1.6" fill="currentColor" />
            </svg>
            <span className="text-[#94A3B8] font-medium">Location</span>
            {shortPlace(place) || "California"}
          </button>

          <Link
            to={isPro ? "/pro/notifications" : "/account/notifications"}
            className={`${press} relative inline-flex size-11 items-center justify-center rounded-xl border border-[#E7EAF0] bg-white text-[#334155]`}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 7.5a4.5 4.5 0 1 1 9 0c0 3.2 1 4.2 1 4.2H3.5s1-1 1-4.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M7.2 14.2a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {(isPro ? inboxCount : customerInboxTotal) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
                {(isPro ? inboxCount : customerInboxTotal) > 9 ? "9+" : isPro ? inboxCount : customerInboxTotal}
              </span>
            )}
          </Link>

          <Link
            to={isPro ? "/pro/profile" : "/account/profile"}
            className={`${press} inline-flex max-w-[200px] items-center gap-2 rounded-full border border-[#E7EAF0] bg-white py-1.5 pl-1.5 pr-3`}
            aria-label={`${firstName} profile`}
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5b46f5,#3b82f6)] text-[13px] font-bold text-white">
              {initial}
            </span>
            <span className="hidden truncate text-[13px] font-semibold text-[#0b1220] sm:block">
              {isPro ? displayName : "My Account"}
            </span>
          </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {title && <h1 className="mb-5 text-xl font-bold tracking-[-0.03em] lg:hidden">{title}</h1>}
          {children}
        </main>
      </div>

      {locOpen && (
        <LocationPicker
          place={place}
          onClose={() => setLocOpen(false)}
          onApply={() => setPlace(readPlace())}
        />
      )}
    </div>
  );
}
