import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import { ProTable } from "./ProUi";
import { useProData } from "./useProData";

export default function ProUsers() {
  const { loading, customers } = useProData();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role || "Customer",
      status: c.status || "Active",
      joined: c.joined ? new Date(c.joined).toLocaleDateString() : "—",
      last_job: c.last_job_title || "",
    }));
    if (!needle) return base;
    return base.filter(
      (u) =>
        u.name?.toLowerCase().includes(needle) ||
        u.email?.toLowerCase().includes(needle) ||
        u.last_job?.toLowerCase().includes(needle),
    );
  }, [customers, q]);

  const columns = [
    { key: "name", label: "Name", render: (r) => <span className="font-semibold text-[#0b1220]">{r.name}</span> },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-bold text-[#475569]">{r.role}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <span className="font-semibold text-[#15803D]">{r.status}</span>,
    },
    { key: "joined", label: "Joined" },
    {
      key: "last_job",
      label: "Latest post",
      render: (r) => (
        <span className="text-[#64748b]">{r.last_job || "—"}</span>
      ),
    },
  ];

  return (
    <ProDashboardLayout
      title="User Management"
      subtitle="Customers from your quotes and unlocked job posts."
      wide
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customers…"
          className="h-11 w-full max-w-md rounded-xl border border-[#E7EAF0] bg-white px-3 text-[14px] outline-none focus:border-[#5b46f5]"
        />
        <Link to="/pro/leads" className="text-sm font-semibold text-[#5b46f5] hover:underline">
          Browse new customer posts →
        </Link>
      </div>
      {loading && <p className="text-sm text-[#64748b]">Loading customers…</p>}
      {!loading && <ProTable columns={columns} rows={rows} empty="Quote or unlock a customer post to see them here." />}
    </ProDashboardLayout>
  );
}