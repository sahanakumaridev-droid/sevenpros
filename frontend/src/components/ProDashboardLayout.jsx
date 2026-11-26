import DashboardShell from "./DashboardShell";

export default function ProDashboardLayout({ title, subtitle, wide, children }) {
  return (
    <DashboardShell role="pro" title={title}>
      <div
        className={`light-page account-light mx-auto text-[#0b1220] ${wide ? "max-w-[1280px]" : "max-w-6xl"}`}
      >
        {(title || subtitle) && (
          <div className="mb-6 hidden lg:block">
            {title && <h1 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#0b1220]">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </DashboardShell>
  );
}