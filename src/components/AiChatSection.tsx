"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, Loader2, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

const AGENT_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

export function AiChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "Halo, saya Sarah dari layanan ekspedisi Obrool. Silakan tanyakan tarif ongkir, nomor resi pengiriman, atau alamat drop point kurir terdekat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("sess_" + Date.now());

  const sampleQuestions = [
    "Ongkir Sokaraja ke Solo 3 kg",
    "Lacak resi JNE 582230008329223",
    "Kantor J&T terdekat di Purwokerto",
    "Tarif kargo barang 50 kg ke Surabaya",
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

      // 1. Coba koneksi langsung ke Obrool API
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
        // Fallback jika direct diblokir
      }

      // 2. Fallback via route proxy
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
        botReply = data.reply || "Maaf, belum dapat merespons saat ini.";
      }

      setMessages((prev) => [...prev, { role: "agent", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Koneksi terputus. Silakan coba kirim ulang." },
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
        text: "Sesi percakapan baru dimulai. Ada yang ingin Anda tanyakan seputar pengiriman paket?",
      },
    ]);
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[640px]">
      {/* Header CS Persona */}
      <div className="px-5 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-zinc-200">
            <img
              src={AGENT_AVATAR}
              alt="Sarah — CS Logistik"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Sarah</h3>
              <span className="text-[0.625rem] px-2 py-0.5 bg-zinc-100 text-zinc-600 font-semibold rounded-full border border-zinc-200">
                CS Ekspedisi
              </span>
            </div>
            <p className="text-xs text-zinc-500">Siap membantu cek tarif & status paket</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-200/60 transition-colors font-medium"
          title="Mulai percakapan baru"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, idx) => {
          const isAgent = m.role === "agent";
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                isAgent ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              {isAgent ? (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 mt-0.5">
                  <img src={AGENT_AVATAR} alt="Sarah" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  isAgent
                    ? "bg-zinc-100/80 text-zinc-900 rounded-tl-sm border border-zinc-200/70"
                    : "bg-zinc-900 text-white rounded-tr-sm shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200">
              <img src={AGENT_AVATAR} alt="Sarah" className="w-full h-full object-cover" />
            </div>
            <div className="bg-zinc-100 border border-zinc-200/70 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5 text-sm text-zinc-600">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
              <span>Sarah sedang mengecek data ekspedisi...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200/70 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 ml-1" />
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-full whitespace-nowrap transition-colors text-xs font-medium shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 bg-white border-t border-zinc-200 flex gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan ke Sarah (misal: ongkir Sokaraja ke Solo 3kg)..."
          className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
