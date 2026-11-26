import DashboardShell from "./DashboardShell";

export default function AccountLayout({ title, subtitle, children }) {
  return (
    <DashboardShell role="customer" title={title}>
      <div className="light-page account-light mx-auto max-w-6xl text-[#0b1220]">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h1 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#0b1220]">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </DashboardShell>
  );
}
