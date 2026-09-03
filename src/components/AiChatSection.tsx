"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

const AGENT_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

export function AiChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "OPERATOR SARAH STANDBY. Silakan masukkan pertanyaan rute, estimasi tarif, atau nomor resi paket Anda.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("sess_" + Date.now());

  const sampleQuestions = [
    "Ongkir Sokaraja ke Solo 3 kg",
    "Lacak resi JNE 582230008329223",
    "Kantor J&T terdekat Purwokerto",
    "Tarif kargo 50 kg ke Surabaya",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const recentHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const obroolUrl = process.env.NEXT_PUBLIC_OBROOL_API_URL || "https://obrool.com";
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "cmtloaz4p0001ob70a96jvol3";

      let botReply = "";

      // 1. Direct fetch to Obrool API
      try {
        const directRes = await fetch(`${obroolUrl}/api/adp/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            message: text,
            sessionId: sessionIdRef.current,
            guestDeviceId: sessionIdRef.current,
            recentHistory,
          }),
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData.reply) {
            botReply = directData.reply;
          }
        }
      } catch {
        // Fallback
      }

      // 2. Proxy fallback
      if (!botReply) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId: sessionIdRef.current,
            recentHistory,
          }),
        });

        const data = await res.json();
        botReply = data.reply || "OPERATOR BELUM DAPAT MERESPONS SAAT INI.";
      }

      setMessages((prev) => [...prev, { role: "agent", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "ERR: KONEKSI TELEMETRI TERPUTUS." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    sessionIdRef.current = "sess_" + Date.now();
    setMessages([
      {
        role: "agent",
        text: "SESI TELEGRAF DIRESET. Ada yang ingin ditanyakan seputar kiriman?",
      },
    ]);
  };

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono flex flex-col h-[640px]">
      {/* Operator Telegraph Header */}
      <div className="p-4 border-b-2 border-black bg-[#F4F4F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 border-2 border-black overflow-hidden flex-shrink-0 bg-black">
            <img
              src={AGENT_AVATAR}
              alt="Sarah Operator"
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-black uppercase">
                OPERATOR // SARAH
              </span>
              <span className="w-2 h-2 bg-emerald-600 inline-block animate-pulse" />
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">
              DESK: DISPATCH & KONSULTASI EKSPEDISI
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="border border-black px-2.5 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1 uppercase"
        >
          <RotateCcw className="w-3 h-3" />
          <span>[RESET]</span>
        </button>
      </div>

      {/* Teletype Dispatch Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
        {messages.map((m, idx) => {
          const isAgent = m.role === "agent";
          return (
            <div
              key={idx}
              className={`p-3.5 border ${
                isAgent
                  ? "bg-[#FFFEFA] border-black text-black"
                  : "bg-black border-black text-white"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pb-1 mb-1 border-b border-dashed border-current opacity-70">
                <span>{isAgent ? "FROM: SARAH [DISPATCH]" : "FROM: CLIENT [INQUIRY]"}</span>
                <span>#{String(idx + 1).padStart(2, "0")}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap font-mono font-medium">
                {m.text}
              </p>
            </div>
          );
        })}

        {loading && (
          <div className="p-3 border border-black bg-zinc-100 flex items-center gap-2.5 text-xs font-bold uppercase animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>OPERATOR SARAH SEDANG MENGECEK TELEMETRI RUTE...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiry Macros */}
      <div className="p-2 border-t-2 border-black bg-[#F4F4F0] flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="font-bold text-zinc-500 px-1 whitespace-nowrap">[MACRO]:</span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2 py-1 border border-black bg-white hover:bg-black hover:text-white whitespace-nowrap transition-colors font-bold text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Command Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t-2 border-black flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="KETIK PERTANYAAN / RUTE..."
          className="flex-1 px-3 py-2.5 bg-zinc-50 border-2 border-black text-xs sm:text-sm font-bold text-black outline-none focus:bg-white uppercase placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs tracking-wider uppercase transition-all disabled:opacity-40 flex items-center justify-center border-2 border-black active:translate-x-0.5 active:translate-y-0.5"
        >
          <Send className="w-3.5 h-3.5 mr-1" />
          <span>KIRIM</span>
        </button>
      </form>
    </div>
  );
}
