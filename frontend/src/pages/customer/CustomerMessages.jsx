import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AccountLayout from "../../components/AccountLayout";
import JobChatPane from "../../components/JobChatPane";
import client from "../../api/client";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

function ThreadList({ ready, items, activeId, onSelect }) {
  return (
    <div className="border-b border-[#EEF2F7] lg:border-b-0 lg:border-r">
      <div className="border-b border-[#EEF2F7] px-4 py-3">
        <p className="text-[13px] font-bold text-[#0b1220]">Conversations</p>
        <p className="text-[11px] text-[#64748b]">Same thread as listing chat (job_id)</p>
      </div>
      {!ready && <p className="p-4 text-sm text-[#64748b]">Loading…</p>}
      {ready && items.length === 0 && <p className="p-4 text-sm text-[#64748b]">No messages yet — post a project or accept a quote.</p>}
      <ul className="max-h-[420px] overflow-y-auto">
        {items.map((item, idx) => {
          const id = item.job_id || item.listing_id;
          const name = item.from_name || item.pro_name || item.title || "Conversation";
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
                  <span className="mt-0.5 block truncate text-[11px] text-[#64748b]">{item.body || item.preview || "Open chat"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function CustomerMessages() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState(params.get("job") || null);

  const loadInbox = () =>
    client.get("/credits/inbox").then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems(list);
      if (!activeId && list[0]?.job_id) setActiveId(list[0].job_id);
    });

  useEffect(() => {
    loadInbox().finally(() => setReady(true));
    const timer = setInterval(loadInbox, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = items.find((i) => i.job_id === activeId);

  return (
    <AccountLayout title="Messages" subtitle="Chat with pros on your posts — connected by job ID.">
      <div className="grid min-h-[480px] overflow-hidden rounded-[24px] border border-[#E7EAF0] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)] lg:grid-cols-[300px_1fr]">
        <ThreadList ready={ready} items={items} activeId={activeId} onSelect={setActiveId} />
        <JobChatPane
          activeId={activeId}
          activeMeta={active}
          emptyHint="Select a conversation to chat or call your pro."
        />
      </div>
    </AccountLayout>
  );
}