import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AccountLayout from "../../components/AccountLayout";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

const TABS = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "offers", label: "Offers" },
  { id: "messages", label: "Messages" },
];

const ICON = {
  offer: "💬",
  quote: "💰",
  message: "✉️",
  project: "📁",
  review: "⭐",
};

export default function CustomerNotifications() {
  const [inbox, setInbox] = useState({ items: [], pending_quotes: 0, unread: 0 });
  const [posts, setPosts] = useState([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    Promise.all([
      client.get("/credits/inbox").catch(() => ({ data: {} })),
      client.get("/credits/posts/mine").catch(() => ({ data: [] })),
    ]).then(([i, p]) => {
      const data = i.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      setInbox({
        items,
        pending_quotes: data.pending_quotes || 0,
        unread: data.unread || 0,
      });
      setPosts(p.data || []);
      setReady(true);
    });
  }, []);

  const alerts = useMemo(() => {
    const list = [];
    for (const post of posts) {
      const pending = (post.quotes || []).filter((q) => q.status === "pending");
      if (pending.length || post.pending_quotes) {
        list.push({
          id: `offer-${post.id}`,
          kind: "offers",
          icon: ICON.offer,
          title: `${pending.length || post.pending_quotes} new offer${(pending.length || post.pending_quotes) === 1 ? "" : "s"}`,
          body: post.title,
          to: `/listings/${post.id}`,
        });
      }
      list.push({
        id: `proj-${post.id}`,
        kind: "projects",
        icon: ICON.project,
        title: "Project update",
        body: `${post.title} · ${post.status || "active"}`,
        to: `/listings/${post.id}`,
      });
    }
    for (const item of inbox.items) {
      const kind = item.kind === "quote" ? "offers" : "messages";
      list.push({
        id: `inbox-${item.job_id}-${item.kind}`,
        kind,
        icon: kind === "offers" ? ICON.quote : ICON.message,
        title: item.from_name || item.title || "Notification",
        body: item.body || item.preview || "",
        to: item.job_id ? `/listings/${item.job_id}` : "/account/messages",
      });
    }
    return list;
  }, [posts, inbox.items]);

  const visible = alerts.filter((a) => tab === "all" || a.kind === tab);

  return (
    <AccountLayout title="Notifications" subtitle="New offers, messages, and project updates.">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`${press} shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
              tab === t.id ? "bg-[#5b46f5] text-white" : "border border-[#E7EAF0] bg-white text-[#64748b]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!ready && <p className="mt-5 text-sm text-[#64748b]">Loading…</p>}
      {ready && visible.length === 0 && (
        <div className="mt-5 rounded-[24px] border border-[#E7EAF0] bg-white p-6 text-sm text-[#64748b]">
          You&apos;re all caught up.
        </div>
      )}

      <ul className="mt-5 space-y-2.5">
        {visible.map((alert) => (
          <li key={alert.id}>
            <Link
              to={alert.to}
              className={`${press} flex items-start gap-3 rounded-[20px] border border-[#E7EAF0] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.04)]`}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {alert.icon}
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0b1220]">{alert.title}</p>
                <p className="mt-0.5 text-[12px] text-[#64748b]">{alert.body}</p>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AccountLayout>
  );
}