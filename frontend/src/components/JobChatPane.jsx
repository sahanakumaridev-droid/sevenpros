import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

const press = "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]";

/**
 * Shared customer ↔ pro thread tied to job_id (ListingMessage rows).
 */
export default function JobChatPane({ activeId, activeMeta, emptyHint }) {
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [contact, setContact] = useState(null);
  const [callTarget, setCallTarget] = useState(null);
  const [error, setError] = useState("");

  const loadThread = useCallback(() => {
    if (!activeId) return Promise.resolve();
    return client
      .get(`/credits/messages/${activeId}`)
      .then((res) => setThread(res.data || []))
      .catch((err) => {
        setError(err.response?.data?.detail || "Could not load messages");
        setThread([]);
      });
  }, [activeId]);

  const loadContact = useCallback(() => {
    if (!activeId) {
      setContact(null);
      return;
    }
    client
      .get(`/credits/messages/${activeId}/contact`)
      .then((res) => {
        setContact(res.data);
        if (res.data?.role === "customer" && res.data.targets?.length) {
          setCallTarget(res.data.targets[0]);
        }
      })
      .catch(() => setContact(null));
  }, [activeId]);

  useEffect(() => {
    if (!activeId) {
      setThread([]);
      setReady(true);
      return;
    }
    setReady(false);
    setError("");
    Promise.all([loadThread(), loadContact()])
      .then(() => client.post(`/credits/inbox/${activeId}/seen`).catch(() => {}))
      .finally(() => setReady(true));
    const poll = setInterval(loadThread, 8000);
    return () => clearInterval(poll);
  }, [activeId, loadThread, loadContact]);

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    setError("");
    try {
      const res = await client.post("/credits/messages", { job_id: activeId, body });
      setDraft("");
      setThread((prev) => [...prev, res.data]);
      loadThread();
    } catch (err) {
      setError(err.response?.data?.detail || "Message not sent — unlock or send a quote first.");
    } finally {
      setSending(false);
    }
  };

  const onCall = () => {
    if (contact?.role === "pro" && contact.phone) {
      window.location.href = `tel:${contact.phone}`;
      return;
    }
    if (contact?.role === "customer" && callTarget?.phone) {
      window.location.href = `tel:${callTarget.phone}`;
      return;
    }
    setError("No phone on file yet. Use the listing page or request a callback in chat.");
  };

  const requestCallback = async () => {
    if (!activeId) return;
    await client.post("/credits/messages", {
      job_id: activeId,
      body: "Please call me back about this project.",
    });
    loadThread();
  };

  if (!activeId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-[#64748b]">
        {emptyHint || "Select a conversation."}
      </div>
    );
  }

  const title = activeMeta?.title || "Project";
  const name = activeMeta?.from_name || activeMeta?.pro_name || contact?.name || "Chat";

  const canCall =
    (contact?.role === "pro" && contact.phone) ||
    (contact?.role === "customer" && callTarget?.phone);

  return (
    <div className="flex min-h-[480px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF2F7] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-sm font-bold text-[#6D28D9]">
            {name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-[#0b1220]">{name}</p>
            <p className="truncate text-[12px] text-[#64748b]">
              {title} · thread <span className="font-mono text-[11px]">{activeId.slice(0, 8)}…</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/listings/${activeId}`}
            className={`${press} inline-flex h-9 items-center rounded-xl border border-[#E7EAF0] px-3 text-[12px] font-semibold text-[#334155]`}
          >
            Open post
          </Link>
          <button
            type="button"
            onClick={onCall}
            disabled={!canCall}
            className={`${press} inline-flex h-9 items-center rounded-xl bg-[#5b46f5] px-3 text-[12px] font-semibold text-white disabled:opacity-40`}
          >
            Call
          </button>
          <button
            type="button"
            onClick={requestCallback}
            className={`${press} inline-flex h-9 items-center rounded-xl border border-[#E7EAF0] px-3 text-[12px] font-semibold text-[#334155]`}
          >
            Request callback
          </button>
        </div>
      </div>

      {contact?.role === "customer" && contact.targets?.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-[#EEF2F7] px-5 py-2">
          {contact.targets.map((t) => (
            <button
              key={t.bid_id}
              type="button"
              onClick={() => setCallTarget(t)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                callTarget?.bid_id === t.bid_id ? "bg-[#5b46f5] text-white" : "bg-[#F1F5F9] text-[#475569]"
              }`}
            >
              {t.name} {t.phone ? "· 📞" : ""}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mx-5 mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#9a3412]">{error}</p>}

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {!ready && <p className="text-sm text-[#64748b]">Loading messages…</p>}
        {ready && thread.length === 0 && (
          <p className="text-center text-sm text-[#64748b]">No messages yet — say hello.</p>
        )}
        {thread.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.mine ? "items-end" : "items-start"}`}>
            {!msg.mine && <span className="mb-0.5 text-[11px] font-semibold text-[#5b46f5]">{msg.name}</span>}
            <p
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.mine ? "bg-[#5b46f5] text-white" : "bg-[#F1F5F9] text-[#0b1220]"
              }`}
            >
              {msg.body}
            </p>
            <span className="mt-0.5 text-[10px] text-[#94A3B8] font-mono">#{String(msg.id).slice(0, 8)}</span>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-[#EEF2F7] p-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="h-11 flex-1 rounded-xl border border-[#E7EAF0] bg-[#F8FAFC] px-4 text-[14px] outline-none focus:border-[#5b46f5]"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className={`${press} inline-flex h-11 shrink-0 items-center rounded-xl bg-[#5b46f5] px-5 text-[13px] font-bold text-white disabled:opacity-50`}
        >
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}