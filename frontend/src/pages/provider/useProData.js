import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import { placeParams, readPlace } from "../../lib/coverage";

export function useProData({ wideLeads = true, refreshMs = 30000 } = {}) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [bids, setBids] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [credits, setCredits] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [inbox, setInbox] = useState({ items: [], unread: 0, pending_quotes: 0 });

  const load = useCallback(() => {
    const place = placeParams(readPlace());
    return Promise.all([
      client.get("/providers/me").catch(() => ({ data: null })),
      client.get("/bookings/provider").catch(() => ({ data: [] })),
      client
        .get("/credits/leads", { params: { ...place, wide: wideLeads } })
        .catch(() => ({ data: { leads: [] } })),
      client.get("/credits/pro/bids").catch(() => ({ data: [] })),
      client.get("/credits/pro/customers").catch(() => ({ data: [] })),
      client.get("/credits/me").catch(() => ({ data: null })),
      client.get("/credits/pro/summary").catch(() => ({ data: null })),
      client.get("/credits/pro/reviews").catch(() => ({ data: [] })),
      client.get("/credits/pro/portfolio").catch(() => ({ data: [] })),
      client.get("/credits/inbox").catch(() => ({ data: { items: [], unread: 0, pending_quotes: 0 } })),
    ]).then(([p, b, l, bidsRes, cust, cred, sum, rev, port, i]) => {
      setProfile(p.data);
      setBookings(b.data || []);
      setLeads(l.data?.leads || []);
      setBids(bidsRes.data || []);
      setCustomers(cust.data || []);
      setCredits(cred.data);
      setSummary(sum.data);
      setReviews(rev.data || []);
      setPortfolio(port.data || []);
      setInbox({
        items: Array.isArray(i.data?.items) ? i.data.items : [],
        unread: i.data?.unread || 0,
        pending_quotes: i.data?.pending_quotes || 0,
      });
      setLoading(false);
    });
  }, [wideLeads]);

  useEffect(() => {
    load();
    const onPlace = () => load();
    window.addEventListener("sevenpros-place", onPlace);
    if (!refreshMs) {
      return () => window.removeEventListener("sevenpros-place", onPlace);
    }
    const timer = setInterval(load, refreshMs);
    return () => {
      window.removeEventListener("sevenpros-place", onPlace);
      clearInterval(timer);
    };
  }, [load, refreshMs]);

  const earnings = useMemo(
    () => summary?.earnings ?? bookings.filter((b) => b.payment_status === "paid" || b.status === "completed").reduce((s, b) => s + (Number(b.final_price) || Number(b.quoted_price) || 0), 0),
    [summary, bookings],
  );

  const completed = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const active = useMemo(
    () => bookings.filter((b) => ["pending", "accepted", "in_progress"].includes(b.status)),
    [bookings],
  );

  const sentOffers = summary?.quotes_sent ?? bids.length;

  const conversionRate = useMemo(() => {
    const won = bids.filter((b) => b.status === "accepted").length;
    const sent = bids.length || 1;
    return Math.round((won / sent) * 100) || 0;
  }, [bids]);

  const ledger = credits?.ledger || [];

  const earningsByMonth = useMemo(() => {
    if (summary?.monthly_earnings?.length) return summary.monthly_earnings;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const buckets = months.map((label, i) => ({ label, value: 0, month: i }));
    for (const b of bookings) {
      if (!b.created_at) continue;
      const d = new Date(b.created_at);
      if (d.getFullYear() !== now.getFullYear()) continue;
      const amount = Number(b.final_price) || Number(b.quoted_price) || 0;
      if (b.payment_status === "paid" || b.status === "completed") {
        buckets[d.getMonth()].value += amount;
      }
    }
    return buckets.slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1).map(({ label, value }) => ({
      label,
      value: Math.round(value),
    }));
  }, [summary, bookings]);

  const categoryMix = useMemo(() => {
    const counts = {};
    for (const lead of leads) {
      const key = lead.category || "General";
      counts[key] = (counts[key] || 0) + 1;
    }
    for (const bid of bids) {
      const key = bid.job_category || "General";
      counts[key] = (counts[key] || 0) + 1;
    }
    const palette = ["#5b46f5", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!entries.length) {
      return [{ label: "General", value: 1, color: palette[0] }];
    }
    return entries.map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
  }, [leads, bids]);

  return {
    loading,
    profile,
    bookings,
    leads,
    bids,
    customers,
    credits,
    summary,
    reviews,
    portfolio,
    inbox,
    earnings,
    completed,
    active,
    sentOffers,
    conversionRate,
    ledger,
    earningsByMonth,
    categoryMix,
    reload: load,
  };
}