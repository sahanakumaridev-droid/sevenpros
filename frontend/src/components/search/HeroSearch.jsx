import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSearch() {
  const navigate = useNavigate();
  const [zip, setZip] = useState("");
  const [service, setService] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set("q", service.trim());
    if (zip.trim()) params.set("zip", zip.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="hero-search w-full rounded-[22px] bg-white p-2 sm:p-2.5 shadow-[0_24px_60px_rgba(7,26,58,0.4)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        <div className="min-w-0 flex-1 px-3 py-2 sm:py-2.5">
          <label htmlFor="hero-zip" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
            ZIP code
          </label>
          <div className="mt-1 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
                stroke="#0879F9"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="10" r="2.2" stroke="#0879F9" strokeWidth="1.8" />
            </svg>
            <input
              id="hero-zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Enter ZIP code"
              inputMode="numeric"
              autoComplete="postal-code"
              className="field-light w-full text-base outline-none"
            />
          </div>
        </div>
        <div className="my-2 hidden w-px bg-[#E6EEF7] sm:block" />
        <div className="min-w-0 flex-[1.45] px-3 py-2 sm:py-2.5">
          <label htmlFor="hero-service" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
            Services
          </label>
          <div className="mt-1 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="#0879F9" strokeWidth="1.8" />
              <path d="M16.5 16.5L21 21" stroke="#0879F9" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              id="hero-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="What services do you need?"
              className="field-light w-full text-base outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#3b82f6] via-[#4f46e5] to-[#7c3aed] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.4)] transition-[filter,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.98] sm:h-auto sm:min-w-[148px] sm:w-auto sm:self-stretch"
        >
          Search Pros
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </form>
  );
}
