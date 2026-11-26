import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { id: "pipeline", label: "Pipeline" },
  { id: "companies", label: "Companies" },
  { id: "people", label: "People" },
  { id: "jobs", label: "Jobs" },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      client.get("/admin/summary"),
      client.get("/admin/providers"),
      client.get("/admin/bookings"),
      client.get("/admin/users"),
    ])
      .then(([s, p, b, u]) => {
        setSummary(s.data);
        setProviders(p.data);
        setBookings(b.data);
        setUsers(u.data);
      })
      .catch((err) => setError(err.response?.data?.detail || "The CRM could not load records. Sign out and enter again."));
  };

  useEffect(load, []);

  const q = query.trim().toLowerCase();
  const companies = useMemo(
    () => providers.filter((p) => !q || `${p.business_name} ${p.email} ${p.city}`.toLowerCase().includes(q)),
    [providers, q],
  );
  const people = useMemo(
    () => users.filter((u) => !u.is_admin && (!q || `${u.full_name} ${u.email}`.toLowerCase().includes(q))),
    [users, q],
  );
  const jobs = useMemo(
    () => bookings.filter((b) => !q || `${b.customer} ${b.provider} ${b.service}`.toLowerCase().includes(q)),
    [bookings, q],
  );

  const setStatus = async (id, kyc_status) => {
    await client.patch(`/admin/providers/${id}/verification`, { kyc_status });
    load();
  };

  const leave = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#0F172A] grid md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="bg-[#0F172A] text-white p-4 flex flex-col gap-1">
        <p className="px-2 pb-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-white/50">SevenPros CRM</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`text-left px-3 h-10 rounded-lg text-sm font-semibold ${
              section === item.id ? "bg-white text-[#0F172A]" : "text-white/80 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={leave} className="mt-auto text-left px-3 h-10 text-sm text-white/60">
          Sign out
        </button>
      </aside>

      <div className="min-w-0">
        <header className="h-16 border-b border-[#E6EAF0] bg-white px-5 flex items-center gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, people, or jobs"
            className="flex-1 max-w-md rounded-lg border border-[#E6EAF0] px-3 py-2 text-sm"
          />
          <p className="text-sm text-slate-500">{user?.full_name}</p>
        </header>

        <div className="p-5">
          {error && <p className="mb-4 text-sm text-[#B91C1C]">{error}</p>}

          {section === "pipeline" && summary && (
            <>
              <h1 className="text-xl font-bold">Pipeline</h1>
              <div className="mt-4 grid sm:grid-cols-4 gap-3">
                {[
                  ["People", summary.users],
                  ["Companies", summary.providers],
                  ["Jobs", summary.bookings],
                  ["Needs review", summary.pending_verification],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white border border-[#E6EAF0] p-4">
                    <p className="text-sm text-[#64748B]">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <h2 className="mt-8 font-bold">Companies waiting on verification</h2>
              <ul className="mt-3 space-y-2">
                {providers.filter((p) => p.kyc_status !== "verified").map((p) => (
                  <li key={p.id} className="rounded-xl bg-white border border-[#E6EAF0] p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.business_name}</p>
                      <p className="text-sm text-[#64748B]">{p.email} · {[p.city, p.state].filter(Boolean).join(", ")} · {p.kyc_status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStatus(p.id, "verified")} className="h-9 px-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold">Approve</button>
                      <button type="button" onClick={() => setStatus(p.id, "rejected")} className="h-9 px-3 rounded-lg text-sm font-semibold text-[#B91C1C]">Reject</button>
                    </div>
                  </li>
                ))}
                {providers.filter((p) => p.kyc_status !== "verified").length === 0 && (
                  <li className="text-sm text-[#64748B]">No companies are waiting.</li>
                )}
              </ul>
            </>
          )}

          {section === "companies" && (
            <RecordTable
              title="Companies"
              columns={["Company", "Contact", "Location", "Verification"]}
              rows={companies.map((p) => [p.business_name, p.email || "—", [p.city, p.state].filter(Boolean).join(", ") || "—", p.kyc_status])}
            />
          )}
          {section === "people" && (
            <RecordTable
              title="People"
              columns={["Name", "Email", "Type"]}
              rows={people.map((u) => [u.full_name, u.email || "—", u.is_provider ? "Provider" : "Customer"])}
            />
          )}
          {section === "jobs" && (
            <RecordTable
              title="Jobs"
              columns={["When", "Customer", "Company", "Status", "Amount"]}
              rows={jobs.map((b) => [b.when, b.customer || "—", b.provider || "—", b.status, b.amount != null ? `$${Number(b.amount).toFixed(2)}` : "—"])}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RecordTable({ title, columns, rows }) {
  return (
    <>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-[#64748B] mt-1">{rows.length} records</p>
      <div className="mt-4 overflow-x-auto rounded-xl bg-white border border-[#E6EAF0]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#64748B]">
              {columns.map((c) => (
                <th key={c} className="p-3 font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[#EEF2F6]">
                {row.map((cell, j) => (
                  <td key={j} className={`p-3 ${j === 0 ? "font-semibold" : ""}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
