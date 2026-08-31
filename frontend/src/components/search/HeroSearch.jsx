import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

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
      className="hero-search w-full rounded-[20px] bg-white p-2 sm:p-2.5 shadow-[0_18px_50px_rgba(7,26,58,0.28)]"
    >
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-stretch">
        <div className="flex-1 min-w-0 px-3 py-2 sm:py-2.5">
          <label htmlFor="hero-zip" className="block text-[11px] font-semibold uppercase tracking-wide text-slate">
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
        <div className="hidden sm:block w-px my-2 bg-[#E6EEF7]" />
        <div className="flex-[1.4] min-w-0 px-3 py-2 sm:py-2.5">
          <label htmlFor="hero-service" className="block text-[11px] font-semibold uppercase tracking-wide text-slate">
            Service
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
              placeholder="What service do you need?"
              className="field-light w-full text-base outline-none"
            />
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto sm:self-stretch sm:min-w-[148px] rounded-[14px] h-12 sm:h-auto">
          Search Pros
        </Button>
      </div>
    </form>
  );
}
