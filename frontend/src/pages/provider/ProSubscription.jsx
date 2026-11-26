import { useNavigate } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { useProData } from "./useProData";
import { press } from "./ProUi";

function buildPlans(credits) {
  const proPrice = credits?.pro_price_cents ? credits.pro_price_cents / 100 : 49;
  return [
    {
      id: "none",
      name: "Pay as you go",
      price: 0,
      leads: `Balance: ${credits?.balance ?? 0} credits · lead cost ${credits?.lead_cost ?? 15}`,
      perks: credits?.revenue?.pro_leads ? [credits.revenue.pro_leads] : ["Buy credit packs", "First 3 bids free"],
    },
    {
      id: "active",
      name: "SevenPros Pro",
      price: proPrice,
      leads: "Active plan skips per-lead unlock fees",
      perks: [credits?.revenue?.pro_bids || "Unlimited unlocks when active"],
    },
  ];
}

export default function ProSubscription() {
  const navigate = useNavigate();
  const { credits, loading } = useProData();
  const active = credits?.subscription_status === "active" ? "active" : "none";
  const PLANS = buildPlans(credits);

  return (
    <ProDashboardLayout title="Subscription Plans" subtitle="Live plan and credit packs from your account.">
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-5 lg:grid-cols-2">
            {PLANS.map((plan) => {
              const isCurrent = active === plan.id;
              return (
                <article
                  key={plan.id}
                  className={`relative rounded-[28px] border p-6 ${
                    isCurrent ? "border-[#5b46f5] bg-white shadow-[0_20px_48px_rgba(91,70,245,0.12)]" : "border-[#E7EAF0] bg-white"
                  }`}
                >
                  {plan.id === "active" && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#5b46f5] px-3 py-1 text-[11px] font-bold uppercase text-white">
                      Recommended
                    </span>
                  )}
                  <p className="text-lg font-bold text-[#0b1220]">{plan.name}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#0b1220]">
                    ${plan.price}
                    {plan.price > 0 && <span className="text-base font-semibold text-[#94A3B8]">/mo</span>}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-[#5b46f5]">{plan.leads}</p>
                  <ul className="mt-4 space-y-2 text-[13px] text-[#64748b]">
                    {plan.perks.map((perk) => (
                      <li key={perk}>• {perk}</li>
                    ))}
                  </ul>
                  {plan.id === "active" ? (
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => navigate("/pay?purpose=subscription")}
                      className={`${press} mt-6 h-11 w-full rounded-xl text-sm font-semibold ${
                        isCurrent ? "bg-[#5b46f5] text-white opacity-90" : "border border-[#E7EAF0] bg-[#F8FAFC] text-[#334155]"
                      }`}
                    >
                      {isCurrent ? "Current plan" : "Checkout · /pay"}
                    </button>
                  ) : (
                    <p className="mt-6 text-[13px] text-[#64748b]">Balance: {credits?.balance ?? 0} credits</p>
                  )}
                </article>
              );
            })}
          </div>
          <h2 className="mb-3 text-base font-bold text-[#0b1220]">Credit packs</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(credits?.packs || []).map((pack) => (
              <article key={pack.id} className="rounded-2xl border border-[#E7EAF0] bg-white p-4">
                <p className="font-bold text-[#0b1220]">{pack.label}</p>
                <p className="mt-1 text-sm text-[#64748b]">{pack.credits} credits</p>
                <p className="mt-2 text-lg font-bold text-[#0b1220]">${(pack.price_cents / 100).toFixed(0)}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/pay?purpose=credits&pack=${pack.id}`)}
                  className={`${press} mt-3 h-10 w-full rounded-xl bg-[#0B1120] text-sm font-semibold text-white`}
                >
                  Buy via checkout
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </ProDashboardLayout>
  );
}