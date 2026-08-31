import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/pro/dashboard", label: "Overview" },
  { to: "/pro/services", label: "Services" },
  { to: "/pro/bookings", label: "Bookings" },
  { to: "/pro/profile", label: "Business Profile" },
];

export default function ProDashboardLayout({ title, children }) {
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold text-ink mb-6">{title}</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-48 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap ${
                  isActive ? "bg-brand-50 text-brand-400" : "text-muted hover:bg-raised"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
