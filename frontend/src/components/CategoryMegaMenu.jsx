import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

function GroupButton({ group, selected, onSelect }) {
  return (
    <button
      type="button"
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[14px] transition-colors duration-150 ${
        selected
          ? "bg-white text-navy font-semibold shadow-[inset_3px_0_0_#0879F9]"
          : "text-navy/75 hover:bg-white/70 hover:text-navy"
      }`}
    >
      <span
        className={`size-8 rounded-lg grid place-items-center text-sm shrink-0 ${selected ? "bg-blue/10" : "bg-white"}`}
        aria-hidden="true"
      >
        {group.icon}
      </span>
      <span className="flex-1 min-w-0 leading-tight">{group.group}</span>
      <span className={`text-[11px] tabular-nums ${selected ? "text-blue" : "text-slate"}`}>
        {group.categories.length}
      </span>
    </button>
  );
}

export default function CategoryMegaMenu({ onNavigate, variant = "desktop" }) {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    client.get("/categories/grouped").then((res) => {
      setGroups(res.data);
      setActive(variant === "mobile" ? null : res.data[0]?.group ?? null);
    });
  }, []);

  const activeGroup = groups.find((g) => g.group === active);
  const categories = activeGroup?.categories ?? [];
  const popular = categories.filter((c) => c.is_popular);
  const rest = categories.filter((c) => !c.is_popular);
  const list = popular.length ? rest : categories;

  if (variant === "mobile") {
    return (
      <div className="px-1">
        {groups.map((g) => {
          const open = active === g.group;
          return (
            <div key={g.group} className="border-b border-white/10">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(open ? null : g.group)}
                className="w-full flex items-center gap-3 px-3 py-3.5 text-left text-white"
              >
                <span className="text-base" aria-hidden="true">
                  {g.icon}
                </span>
                <span className="flex-1 font-semibold tracking-[0.08em] uppercase text-[13px]">{g.group}</span>
                <span className="text-white/50 text-xs tabular-nums">{g.categories.length}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {open && (
                <div className="pb-3 pl-11 pr-3 grid grid-cols-1 gap-1">
                  {g.categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/categories/${c.slug}`}
                      onClick={onNavigate}
                      className="min-h-11 flex items-center rounded-lg px-2 text-sm text-white/80 hover:text-white hover:bg-white/10"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="popover-panel w-full bg-white text-navy rounded-2xl shadow-[0_24px_64px_rgba(7,26,58,0.18)] border border-[#E6EEF7] overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-0 max-h-[min(560px,70vh)]">
        <div className="md:w-[240px] shrink-0 bg-[#F7F9FC] md:border-r border-[#E6EEF7] py-3 overflow-x-auto md:overflow-y-auto">
          <p className="px-4 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate">
            Browse by category
          </p>
          <div className="flex md:block min-w-max md:min-w-0">
            {groups.map((g) => (
              <GroupButton key={g.group} group={g} selected={active === g.group} onSelect={() => setActive(g.group)} />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4 md:p-5 overflow-y-auto">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-bold text-navy tracking-tight">{activeGroup?.group ?? "Categories"}</h3>
              <p className="text-sm text-slate mt-0.5">
                {categories.length} services available in California
              </p>
            </div>
            {activeGroup && (
              <Link
                to={`/search?group=${encodeURIComponent(activeGroup.group)}`}
                onClick={onNavigate}
                className="text-sm font-semibold text-blue hover:underline shrink-0"
              >
                View all →
              </Link>
            )}
          </div>

          {popular.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-orange mb-2">Popular</p>
              <div className="flex flex-wrap gap-2">
                {popular.map((c) => (
                  <Link
                    key={c.id}
                    to={`/categories/${c.slug}`}
                    onClick={onNavigate}
                    className="inline-flex items-center min-h-9 rounded-full border border-[#E6EEF7] bg-[#F7F9FC] px-3 py-1.5 text-[13px] font-medium text-navy hover:border-blue hover:text-blue"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-1">
            {(list.length ? list : categories).map((c) => (
              <Link
                key={c.id}
                to={`/categories/${c.slug}`}
                onClick={onNavigate}
                className="flex items-center min-h-11 px-2.5 rounded-lg text-[14px] font-medium text-navy hover:bg-[#F5F8FC] hover:text-blue"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 md:px-5 py-3 border-t border-[#E6EEF7] bg-[#F7F9FC]">
        <p className="text-sm text-slate">500+ verified service categories across California</p>
        <Link to="/search" onClick={onNavigate} className="text-sm font-semibold text-blue hover:underline">
          Browse all categories →
        </Link>
      </div>
    </div>
  );
}
