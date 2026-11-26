import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const money = (cents) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

const STEPS = [
  { n: "01", title: "Buy a pack", body: "Checkout adds credits to your balance. Pros use them for leads; customers use them to open contacts." },
  { n: "02", title: "How SevenPros earns", body: "Revenue = pro credit packs + Pro subscription ($49/mo) + customer contact packs + 8% booking fee when a quote is accepted (min $5)." },
  { n: "03", title: "Premium loop", body: "Customer posts → pro unlocks/bids → customer accepts → pays quote + fee → booking confirmed. Chat stays on the listing; Call uses the saved phone." },
];

const CUSTOMER = { id: "members-3", label: "3 contacts", credits: 3, price_cents: 1900, note: "Best if you are hiring. Opens three people." };
const PRO_PACKS = [
  { id: "starter", label: "Starter", credits: 100, price_cents: 1000, note: "A first batch of job leads." },
  { id: "growth", label: "Growth", credits: 275, price_cents: 2500, note: "For a week of active quoting." },
  { id: "business", label: "Business", credits: 600, price_cents: 5000, note: "Lowest price per credit.", best: true },
];

function rise(index) {
  return {
    animation: "rise-in 420ms ease-out both",
    animationDelay: `${index * 70}ms`,
  };
}

export default function Credits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (!user) return;
    client.get("/credits/me").then((res) => setWallet(res.data)).catch(() => {});
  }, [user]);

  const buy = (pack) => {
    if (!user) {
      navigate("/login?next=/credits");
      return;
    }
    navigate(`/pay?purpose=credits&pack=${pack}`);
  };

  const pro = Boolean(user?.is_provider);
  const offers = pro ? (wallet?.packs || PRO_PACKS) : [wallet?.packs?.[0] || CUSTOMER];

  return (
    <div className="min-h-[70vh] bg-[#f4f6f8] text-[#14181d]">
      <div className="container-page max-w-5xl py-10">
        <p className="text-[13px] font-bold tracking-[0.08em] text-[#0b7c73]">CREDITS</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">How many to buy</h1>
        <p className="mt-2 max-w-xl text-[15px] text-[#3c4650]">
          {pro
            ? "Pros buy credits (or Pro) to unlock leads and bid. That is the main pro-side revenue."
            : "Customers buy contact packs, then pay quote + platform fee when accepting a bid. That is customer-side revenue."}
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.n} style={rise(index)} className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,32,0.05)]">
              <p className="text-[13px] font-bold tracking-[0.08em] text-[#0b7c73]">{step.n}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#3c4650]">{step.body}</p>
            </article>
          ))}
        </div>

        {user && wallet && (
          <p style={rise(3)} className="mt-6 text-sm font-semibold text-[#3c4650]">
            Balance now: <span className="tabular-nums text-[#14181d]">{wallet.balance}</span>
            {pro
              ? ` · a lead costs ${wallet.lead_cost} credits`
              : ` · ${wallet.free_contacts_left ?? 3} free pro contacts left, then 1 credit each`}
          </p>
        )}

        <div className={`mt-4 grid gap-3 ${pro ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
          {offers.map((pack, index) => {
            const best = pack.id === "business" || !pro;
            const each = pack.credits ? pack.price_cents / pack.credits / 100 : 0;
            return (
              <article
                key={pack.id}
                style={rise(4 + index)}
                className={`flex flex-col rounded-[28px] p-6 transition-transform duration-200 ease-out hover:-translate-y-1 ${
                  best ? "bg-[#10231f] text-white" : "bg-white text-[#14181d] shadow-[0_10px_30px_rgba(15,23,32,0.05)]"
                }`}
              >
                <p className={`text-[12px] font-bold tracking-[0.08em] ${best ? "text-[#8ee0c8]" : "text-[#0b7c73]"}`}>
                  {best ? "BEST OFFER" : "PACK"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{pack.label}</h2>
                <p className="mt-3 text-4xl font-semibold tabular-nums tracking-[-0.04em]">{money(pack.price_cents)}</p>
                <p className={`mt-1 text-sm ${best ? "text-white/70" : "text-[#5c6770]"}`}>
                  {pack.credits} credits · ${each.toFixed(2)} each
                </p>
                <p className={`mt-3 text-sm leading-6 ${best ? "text-white/80" : "text-[#3c4650]"}`}>
                  {pack.note || (best ? "Lowest price per credit." : "A smaller pack if you are testing the market.")}
                </p>
                <button
                  type="button"
                  onClick={() => buy(pack.id)}
                  className={`mt-5 h-11 rounded-full px-4 text-sm font-bold tracking-[0.04em] active:scale-[0.98] ${
                    best ? "bg-white text-[#10231f]" : "bg-[#14181d] text-white"
                  }`}
                >
                  {user ? `BUY ${pack.credits}` : "SIGN IN TO BUY"}
                </button>
              </article>
            );
          })}
        </div>

        {pro && wallet && (
          <button
            type="button"
            onClick={() => navigate("/pay?purpose=subscription")}
            className="mt-4 h-11 rounded-full border border-[#14181d] px-4 text-sm font-bold"
          >
            PRO PLAN {money(wallet.pro_price_cents)} / MONTH
          </button>
        )}

        {!user && (
          <Link to="/login?next=/credits" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#14181d] px-5 text-sm font-bold tracking-[0.04em] text-white">
            SIGN IN
          </Link>
        )}

        <p className="mt-8 max-w-2xl text-sm text-[#3c4650]">
          SMS is on hold until a provider is confirmed. Notices go by email. The email service includes 500 free messages a day. More than that is chargeable.
        </p>

        {wallet?.ledger?.length > 0 && (
          <ul className="mt-8 divide-y divide-[#eceff2] overflow-hidden rounded-[24px] bg-white">
            {wallet.ledger.map((row) => (
              <li key={row.id} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <span>{row.note || row.kind}</span>
                <span className="font-semibold tabular-nums">{row.amount > 0 ? `+${row.amount}` : row.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
