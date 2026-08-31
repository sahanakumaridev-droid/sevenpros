import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I’m the SEVENPROS matchmaker. Tell me the job — leaky faucet, AC, cleaning, painting — and I’ll rank verified California pros.",
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
      const res = await client.post("/ai/chat", { message: text });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.data.reply, providers: res.data.providers || [] },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Matchmaker is offline. Start the backend on port 8000 and try again.", providers: [] },
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
        className="fixed z-50 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] size-14 rounded-full bg-brand-grad text-white shadow-[0_12px_32px_rgba(46,49,146,0.45)]"
        aria-label={open ? "Close AI matchmaker" : "Open AI matchmaker"}
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
              <p className="text-[11px] text-white/50">Matchmaker · Best Match ranking</p>
            </div>
          </div>
          <div className="h-[340px] overflow-y-auto px-4 py-3 space-y-3">
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
              placeholder="Describe the job…"
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
