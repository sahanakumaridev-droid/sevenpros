import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/account/bookings", label: "My Bookings" },
  { to: "/account/favorites", label: "Favorites" },
  { to: "/account/profile", label: "Settings" },
];

export default function AccountLayout({ title, subtitle, children }) {
  return (
    <div className="bg-[#F4F7FB] text-[#071A3A] min-h-full">
      <div className="container-page py-8 md:py-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue">Account</p>
        <h1 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]">{title}</h1>
        {subtitle && <p className="mt-1 text-slate text-pretty max-w-xl">{subtitle}</p>}

        <div className="mt-6 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <nav
            className="w-full lg:w-56 shrink-0 rounded-2xl border border-[#E6EEF7] bg-white p-2 flex lg:flex-col gap-1 overflow-x-auto"
            aria-label="Account"
          >
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `px-3 min-h-11 rounded-xl text-sm font-semibold whitespace-nowrap inline-flex items-center ${
                    isActive ? "bg-brand-grad text-white" : "text-navy/70 hover:bg-[#F0F5FB]"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1 min-w-0 w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
