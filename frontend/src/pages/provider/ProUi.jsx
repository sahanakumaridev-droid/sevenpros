const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

export function ProCard({ className = "", children }) {
  return (
    <div className={`rounded-[24px] border border-[#E7EAF0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,32,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function StatTiles({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[20px] border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,32,0.04)]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748b]">{item.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#0b1220]">{item.value}</p>
          {item.hint && <p className="mt-1 text-[12px] text-[#94A3B8]">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function ProTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`${press} rounded-full px-4 py-2 text-[13px] font-semibold ${
            active === t.id ? "bg-[#5b46f5] text-white" : "border border-[#E7EAF0] bg-white text-[#64748b]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function BarChart({ data, max }) {
  const peak = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div
            className="w-full max-w-[36px] rounded-t-lg bg-[linear-gradient(180deg,#5b46f5,#3b82f6)]"
            style={{ height: `${Math.max(8, (d.value / peak) * 100)}%` }}
          />
          <span className="truncate text-[10px] font-medium text-[#94A3B8]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutStat({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = segments
    .map((s) => {
      const start = (acc / total) * 100;
      acc += s.value;
      const end = (acc / total) * 100;
      return `${s.color} ${start}% ${end}%`;
    })
    .join(", ");
  return (
    <div className="flex items-center gap-6">
      <div
        className="size-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
        aria-hidden="true"
      />
      <ul className="space-y-2 text-[13px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[#64748b]">{s.label}</span>
            <span className="font-semibold text-[#0b1220]">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProTable({ columns, rows, empty }) {
  if (!rows.length) {
    return <p className="py-10 text-center text-sm text-[#64748b]">{empty || "No rows yet."}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[#E7EAF0] bg-white">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="border-b border-[#EEF2F7] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-bold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFBFC]">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-[#334155]">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { press };