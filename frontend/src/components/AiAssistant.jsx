import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I’m SEVENPROS AI. Tell me the job id and your city, and I’ll rank pros for that job.",
      providers: [],
    },
  ]);

  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("sevenpros:open-ai", open);
    return () => window.removeEventListener("sevenpros:open-ai", open);
  }, []);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text, providers: [] }]);
    setBusy(true);
    try {
      const res = await client.post("/ai/chat", { message: text, role });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.data.reply, providers: res.data.providers || [] },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "AI is offline. Try again in a moment.", providers: [] },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] grid size-14 place-items-center rounded-full bg-[#14181d] text-sm font-bold text-white shadow-[0_12px_32px_rgba(20,24,29,0.28)]"
        aria-label={open ? "Close AI" : "Open AI"}
      >
        {open ? "×" : "AI"}
      </button>

      {open && (
        <div className="fixed z-50 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] w-[min(100vw-2rem,380px)] rounded-2xl border border-white/10 bg-[#0c1224]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <img src="/logo-mark.png" alt="" className="size-8 rounded-lg" />
            <div>
              <p className="text-xs font-display font-bold tracking-[0.14em] uppercase text-white">
                SEVEN<span className="text-brand-grad">PROS</span> AI
              </p>
              <p className="text-[11px] text-white/50">AI · Best Match ranking</p>
            </div>
          </div>
          <div className="h-[340px] overflow-y-auto px-4 py-3 space-y-3">
            {!role && (
              <div>
                <p className="text-sm text-white">Are you a customer or a pro?</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRole("customer")} className="h-11 rounded-xl bg-white text-sm font-semibold text-[#14181d]">Customer</button>
                  <button type="button" onClick={() => setRole("pro")} className="h-11 rounded-xl bg-[#f5c400] text-sm font-semibold text-[#1a1400]">Pro</button>
                </div>
                <p className="mt-3 text-xs text-white/60">Matching uses the job id and your city.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm text-left ${
                    m.role === "user" ? "bg-brand-grad text-white" : "bg-white/8 text-white/90"
                  }`}
                >
                  {m.text.replace(/\*\*/g, "")}
                </div>
                {m.providers?.length > 0 && (
                  <div className="mt-2 space-y-1.5 text-left">
                    {m.providers.map((p) => (
                      <Link
                        key={p.id}
                        to={`/providers/${p.id}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{p.business_name}</span>
                          <span className="text-[11px] text-cyan tabular-nums">{p.match_score}</span>
                        </div>
                        <p className="text-[11px] text-white/50">
                          {p.city} · {p.avg_rating}★ · from ${p.starting_price ?? "—"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <p className="text-xs text-white/40">Ranking pros…</p>}
          </div>
          <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={role === "pro" ? "Job id and city" : "Job id and your city"}
              disabled={!role}
              className="flex-1 rounded-xl px-3 py-2 text-sm"
            />
            <button type="submit" className="btn btn-primary h-10 px-4 rounded-xl">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
