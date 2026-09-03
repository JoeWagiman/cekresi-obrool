"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export function AiChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "Halo! Saya Asisten AI Ekspedisi CekResi.id. Tanyakan ongkir, cek nomor resi, atau cari drop point kurir terdekat dengan bahasa santai. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("sess_" + Date.now());

  const sampleQuestions = [
    "Cek ongkir Sokaraja ke Surakarta 3 kg",
    "Lacak resi JNE 582230008329223",
    "Kantor cabang J&T terdekat di Purwokerto",
    "Apakah ada layanan kargo untuk barang 50 kg?",
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
      const botReply = data.reply || "Maaf, belum dapat merespons saat ini.";

      setMessages((prev) => [...prev, { role: "agent", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Maaf, koneksi ke asisten AI terputus. Silakan coba kembali." },
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
        text: "Percakapan baru dimulai! Ada yang ingin Anda tanyakan seputar cek ongkir, resi, atau kurir?",
      },
    ]);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[560px]">
      {/* Header Chat */}
      <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <span>Asisten AI Logistik</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <span className="text-[0.6875rem] text-zinc-400">Paham bahasa santai, slang, & typo wilayah</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-200/50 transition-colors"
          title="Mulai percakapan baru"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[0.6875rem]">Reset Sesi</span>
        </button>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m, idx) => {
          const isAgent = m.role === "agent";
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                isAgent ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isAgent ? "bg-blue-600 text-white" : "bg-zinc-800 text-white"
                }`}
              >
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isAgent
                    ? "bg-zinc-100 text-zinc-800 rounded-tl-sm border border-zinc-200/70"
                    : "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-100 border border-zinc-200/70 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Memeriksa database ekspedisi...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-zinc-50/60 border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto text-[0.6875rem] no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 ml-1" />
        <span className="text-zinc-400 font-medium whitespace-nowrap">Coba tanyakan:</span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-300 text-zinc-600 hover:text-blue-700 rounded-full whitespace-nowrap transition-colors"
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
        className="p-3 bg-white border-t border-zinc-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan atau rute pengiriman (misal: ongkir pwt ke jkt 2kg)..."
          className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
