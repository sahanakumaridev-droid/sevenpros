import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../../api/client";
import ProDashboardLayout from "../../components/ProDashboardLayout";
import JobChatPane from "../../components/JobChatPane";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

function ThreadList({ ready, items, activeId, onSelect }) {
  return (
    <div className="border-b border-[#EEF2F7] lg:border-b-0 lg:border-r">
      <div className="border-b border-[#EEF2F7] px-4 py-3">
        <p className="text-[13px] font-bold text-[#0b1220]">Customer threads</p>
        <p className="text-[11px] text-[#64748b]">Threads open after you quote a post</p>
      </div>
      {!ready && <p className="p-4 text-sm text-[#64748b]">Loading…</p>}
      {ready && items.length === 0 && (
        <p className="p-4 text-sm text-[#64748b]">Send a quote on Find Jobs to start messaging.</p>
      )}
      <ul className="max-h-[420px] overflow-y-auto">
        {items
          .filter((item) => item.kind === "message" || item.body)
          .map((item, idx) => {
            const id = item.job_id;
            const name = item.from_name || item.title || "Customer";
            const selected = id === activeId;
            return (
              <li key={id || idx}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className={`${press} flex w-full items-center gap-3 px-4 py-3 text-left ${
                    selected ? "bg-[#EDE9FE]/60" : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[12px] font-bold text-[#1D4ED8]">
                    {name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold text-[#0b1220]">{name}</span>
                      {item.unread && <span className="size-2 rounded-full bg-[#ef4444]" />}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#64748b]">{item.body || item.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function ProMessages() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState(params.get("job") || null);

  const loadInbox = () =>
    client.get("/credits/inbox").then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems(list);
      const msgItems = list.filter((i) => i.kind === "message" || i.body);
      if (!activeId && msgItems[0]?.job_id) setActiveId(msgItems[0].job_id);
    });

  useEffect(() => {
    loadInbox().finally(() => setReady(true));
    const timer = setInterval(loadInbox, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = items.find((i) => i.job_id === activeId);

  return (
    <ProDashboardLayout title="Messages" subtitle="Same chat as /listings/{job_id} — customer ↔ pro by message ID." wide>
      <div className="grid min-h-[480px] overflow-hidden rounded-[24px] border border-[#E7EAF0] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)] lg:grid-cols-[300px_1fr]">
        <ThreadList ready={ready} items={items} activeId={activeId} onSelect={setActiveId} />
        <JobChatPane
          activeId={activeId}
          activeMeta={active}
          emptyHint="Select a customer thread — quote a job first if empty."
        />
      </div>
    </ProDashboardLayout>
  );
}