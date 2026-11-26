import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add your business name, service area, and verification details.",
  },
  {
    n: "02",
    title: "List your services",
    body: "Set prices, photos, and which jobs you take — including emergency work.",
  },
  {
    n: "03",
    title: "Get booked",
    body: "Customers across California find you. You accept, do the job, and get paid.",
  },
];

const PERKS = [
  { title: "Quality leads", body: "Reach homeowners and businesses already looking to book." },
  { title: "Lower fees", body: "Keep more of what you earn compared with typical marketplaces." },
  { title: "Business tools", body: "Manage services, bookings, and reviews from one dashboard." },
  { title: "Reputation", body: "Verified badges and reviews that help you win the next job." },
];

export default function ProviderOnboarding() {
  const { user, loading, becomeProvider } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [stay, setStay] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    city: "",
    street: "",
    phone: "",
    license_number: "",
    website: "",
  });

  useEffect(() => {
    if (!stay && !loading && user?.is_provider) {
      navigate("/pro/dashboard", { replace: true });
    }
  }, [loading, user, navigate, stay]);

  const start = async (e) => {
    e?.preventDefault();
    if (!user) {
      navigate("/signup?next=/become-a-pro");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setStay(true);
      const res = await client.post("/auth/register-company", form);
      await becomeProvider();
      setResult(res.data.verification);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not verify this company.");
    } finally {
      setBusy(false);
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (user?.is_provider && !stay) return null;

  return (
    <div className="light-page bg-white text-[#14181d]">
      <section className="container-page py-10 md:py-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] gap-10 items-center">
        <div>
          <p className="inline-flex items-center rounded-full bg-blue/10 text-blue text-[11px] font-semibold tracking-wide uppercase px-3 py-1">
            For professionals
          </p>
          <h1 className="mt-4 font-bold tracking-[-0.03em] leading-[1.1] text-[clamp(1.85rem,5vw,3.25rem)]">
            Grow your business on <span className="text-blue">SevenPros</span>
          </h1>
          <p className="mt-4 text-slate text-lg max-w-xl text-pretty">
            Set up your profile, list services, and start getting booking requests from customers across California.
          </p>
          {error && (
            <p className="mt-4 text-sm font-medium text-[#B91C1C]" role="alert">
              {error}
            </p>
          )}
          {user ? (
            <form onSubmit={start} className="mt-7 grid sm:grid-cols-2 gap-3 max-w-xl">
              {[
                ["business_name", "Legal company name", true],
                ["city", "City", true],
                ["street", "Street address", false],
                ["phone", "Business phone (for customer calls)", true],
                ["license_number", "California license number", false],
                ["website", "Website", false],
              ].map(([key, label, required]) => (
                <label key={key} className="text-sm font-semibold">
                  {label}
                  <input
                    required={required}
                    value={form[key]}
                    onChange={setField(key)}
                    className="mt-1 w-full rounded-xl border border-line bg-raised px-3 py-2.5 font-normal"
                  />
                </label>
              ))}
              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={busy || loading} className="btn btn-primary h-12 px-6 rounded-xl text-sm">
                  {busy ? "Checking public records…" : "Verify company and continue"}
                </button>
                <Link
                  to="/search"
                  className="h-12 px-5 rounded-xl border border-line bg-raised text-sm font-semibold inline-flex items-center"
                >
                  See how customers find you
                </Link>
              </div>
            </form>
          ) : (
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={start}
              disabled={busy || loading}
              className="btn btn-primary h-12 px-6 rounded-xl text-sm"
            >
              Create a free pro account
            </button>
            <Link
              to="/search"
              className="h-12 px-5 rounded-xl border border-line bg-raised text-sm font-semibold inline-flex items-center"
            >
              See how customers find you
            </Link>
          </div>
          )}
          {result && (
            <div className={`mt-4 rounded-2xl border p-4 text-sm ${result.status === "verified" ? "border-[#1BBF7A] bg-[#F0FBF6]" : "border-[#F5C16C] bg-[#FFF8EC]"}`}>
              <p className="font-bold">{result.status === "verified" ? "Company verified" : "Verification pending"}</p>
              <p className="mt-1">{result.message}</p>
              {result.matched_name && (
                <p className="mt-1">Matched record: {result.matched_name}{result.matched_address ? ` · ${result.matched_address}` : ""}</p>
              )}
              <p className="mt-1">{result.licensed ? "License number format accepted." : "No valid California license number on file."}</p>
              <Link to="/pro/dashboard" className="mt-3 inline-flex font-semibold text-blue">
                Go to your dashboard →
              </Link>
            </div>
          )}
          <p className="mt-3 text-[13px] text-slate">Free to start. No listing fee. California companies are checked against public business records.</p>
        </div>

        <div className="relative">
          <div className="rounded-[28px] overflow-hidden bg-overlay min-h-[320px] shadow-[0_20px_50px_rgba(7,26,58,0.12)]">
            <img src="/for-pros.jpg" alt="Service professionals at work" className="w-full h-[340px] object-cover" />
          </div>
          <aside className="absolute -left-3 bottom-6 w-[min(220px,70%)] rounded-2xl bg-raised p-3 shadow-[0_16px_40px_rgba(7,26,58,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">This week</p>
            <p className="mt-1 text-lg font-bold tabular-nums">12 new leads</p>
            <p className="text-[12px] text-slate">Typical for an active California pro</p>
          </aside>
        </div>
      </section>

      <section className="container-page pb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-2xl border border-line bg-raised p-5">
              <p className="text-blue font-bold tabular-nums">{step.n}</p>
              <h2 className="mt-2 font-bold text-lg">{step.title}</h2>
              <p className="mt-1 text-sm text-slate text-pretty">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <h2 className="font-bold text-2xl md:text-[28px] tracking-[-0.03em]">Why pros switch to SevenPros</h2>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="rounded-2xl border border-line bg-raised p-5 flex gap-3">
              <span className="size-8 rounded-full bg-overlay text-blue grid place-items-center shrink-0 font-bold">✓</span>
              <div>
                <h3 className="font-bold">{perk.title}</h3>
                <p className="mt-1 text-sm text-slate">{perk.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[28px] bg-navy text-white px-6 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 className="font-bold text-2xl tracking-[-0.03em]">Ready to take jobs 7 days a week?</h2>
            <p className="mt-2 text-white/70 max-w-md">Join the California marketplace customers already use to find verified local help.</p>
          </div>
          <button
            type="button"
            onClick={start}
            disabled={busy || loading}
            className="h-12 px-6 rounded-xl bg-white text-[#071A3A] font-semibold shrink-0"
          >
            {user ? "Open your pro profile" : "Get started free"}
          </button>
        </div>
      </section>
    </div>
  );
}
