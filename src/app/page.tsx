"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  Package,
  Calculator,
  ArrowRight,
  ArrowRightLeft,
  Loader2,
  Clock,
  Sparkles,
  RotateCcw,
  AlertCircle
} from "lucide-react";

interface ShippingOption {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface TrackingData {
  status: number;
  message: string;
  data?: {
    summary?: {
      courier?: string;
      service?: string;
      status?: string;
      date?: string;
      amount?: string;
      weight?: string;
    };
    detail?: {
      origin?: string;
      destination?: string;
      shipper?: string;
      receiver?: string;
    };
    history?: Array<{
      note: string;
      date: string;
      city_name?: string;
    }>;
  };
}

interface StreamItem {
  id: string;
  type: "query" | "rate_result" | "track_result" | "chat_response" | "error";
  userText?: string;
  rates?: ShippingOption[];
  origin?: string;
  destination?: string;
  weight?: string;
  trackingData?: TrackingData;
  awb?: string;
  courier?: string;
  replyText?: string;
}

const AGENT_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";

const COURIER_LIST = [
  { id: "jne", name: "JNE" },
  { id: "jnt", name: "J&T" },
  { id: "sicepat", name: "SiCepat" },
  { id: "pos", name: "POS" },
  { id: "anteraja", name: "Anteraja" },
  { id: "wahana", name: "Wahana" },
  { id: "tiki", name: "TIKI" },
  { id: "ninja", name: "Ninja" },
  { id: "lion", name: "Lion" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"auto" | "cost" | "track">("auto");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<StreamItem[]>([]);

  // Specific inputs for dedicated modes
  const [costOrigin, setCostOrigin] = useState("Sokaraja");
  const [costDest, setCostDest] = useState("Surakarta");
  const [costWeight, setCostWeight] = useState("3");

  const [trackCourier, setTrackCourier] = useState("jne");
  const [trackAwb, setTrackAwb] = useState("");

  const sessionIdRef = useRef<string>("sess_" + Date.now());
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stream.length > 0) {
      streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [stream, loading]);

  // Handle Natural Language / Auto Query
  const handleAutoSubmit = async (textToSubmit?: string) => {
    const rawText = (textToSubmit || query).trim();
    if (!rawText || loading) return;

    setQuery("");
    setLoading(true);

    const queryId = "q_" + Date.now();
    setStream((prev) => [
      ...prev,
      { id: queryId, type: "query", userText: rawText },
    ]);

    try {
      // 1. Check if it matches AWB tracking (e.g. "lacak 582230008329223" or long digits)
      const awbMatch = rawText.match(/(?:resi|lacak|awb)?\s*([a-zA-Z]{0,4}\d{9,22})/i);
      const isPureDigits = /^\d{10,22}$/.test(rawText.replace(/\s+/g, ""));

      if (rawText.toLowerCase().startsWith("lacak") || rawText.toLowerCase().startsWith("resi") || isPureDigits) {
        const extractedAwb = awbMatch ? awbMatch[1] : rawText.trim();
        let detectedCourier = "jne";
        for (const c of COURIER_LIST) {
          if (rawText.toLowerCase().includes(c.id) || rawText.toLowerCase().includes(c.name.toLowerCase())) {
            detectedCourier = c.id;
            break;
          }
        }

        const res = await fetch(`/api/track?courier=${detectedCourier}&awb=${encodeURIComponent(extractedAwb)}`);
        const data = await res.json();

        if (data.status === 200 && data.data) {
          setStream((prev) => [
            ...prev,
            {
              id: "res_" + Date.now(),
              type: "track_result",
              trackingData: data,
              awb: extractedAwb,
              courier: detectedCourier,
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // 2. Check if it matches Route Cost (e.g. "Sokaraja ke Solo 3kg" or "ongkir Jakarta ke Surabaya")
      const routeMatch = rawText.match(/(?:ongkir|tarif|cek)?\s*(?:dari)?\s*([a-zA-Z\s]+?)\s+(?:ke|tujuan)\s+([a-zA-Z\s]+?)(?:\s+(\d+(?:[.,]\d+)?)\s*(?:kg|kilo)?)?$/i);

      if (routeMatch && routeMatch[1] && routeMatch[2]) {
        const originClean = routeMatch[1].replace(/^(ongkir|tarif|cek)\s+/i, "").trim();
        const destClean = routeMatch[2].trim();
        const weightClean = routeMatch[3] ? routeMatch[3].replace(",", ".") : "1";
        const weightGrams = Math.round(parseFloat(weightClean) * 1000);

        const params = new URLSearchParams({
          origin: originClean,
          destination: destClean,
          weight: String(weightGrams),
        });

        const res = await fetch(`/api/cost?${params.toString()}`);
        const data = await res.json();

        if (data.status === 200 && Array.isArray(data.rates) && data.rates.length > 0) {
          const sortedRates = [...data.rates].sort((a, b) => (a.cost || 0) - (b.cost || 0));
          setStream((prev) => [
            ...prev,
            {
              id: "res_" + Date.now(),
              type: "rate_result",
              rates: sortedRates,
              origin: data.origin || originClean,
              destination: data.destination || destClean,
              weight: weightClean,
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // 3. Conversational / Complex inquiry via Sarah (Obrool AI Engine)
      const obroolUrl = process.env.NEXT_PUBLIC_OBROOL_API_URL || "https://obrool.com";
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "cmtloaz4p0001ob70a96jvol3";

      let botReply = "";

      // Direct client fetch (avoids Vercel function timeout)
      try {
        const directRes = await fetch(`${obroolUrl}/api/adp/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            message: rawText,
            sessionId: sessionIdRef.current,
            guestDeviceId: sessionIdRef.current,
          }),
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData.reply) botReply = directData.reply;
        }
      } catch {
        // fallback
      }

      if (!botReply) {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: rawText,
              sessionId: sessionIdRef.current,
            }),
          });
          const data = await res.json();
          botReply = data.reply || "Maaf, belum dapat memproses pertanyaan saat ini.";
        } catch {
          botReply = "Maaf, koneksi ke asisten sedang sibuk. Silakan coba kembali.";
        }
      }

      setStream((prev) => [
        ...prev,
        {
          id: "res_" + Date.now(),
          type: "chat_response",
          replyText: botReply,
        },
      ]);
    } catch (err) {
      console.error("[Search Error]", err);
      setStream((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          type: "error",
          replyText: err instanceof Error ? err.message : "Terjadi gangguan saat memproses pencarian. Silakan coba kembali.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Shipping Cost Calculation
  const handleCostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costOrigin.trim() || !costDest.trim() || loading) return;

    const queryDesc = `Cek tarif ${costOrigin} ke ${costDest} (${costWeight} kg)`;
    setLoading(true);

    setStream((prev) => [
      ...prev,
      { id: "q_" + Date.now(), type: "query", userText: queryDesc },
    ]);

    try {
      const weightNum = parseFloat(costWeight) || 1;
      const weightGrams = Math.round(weightNum * 1000);

      const params = new URLSearchParams({
        origin: costOrigin.trim(),
        destination: costDest.trim(),
        weight: String(weightGrams),
      });

      const res = await fetch(`/api/cost?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mendapatkan informasi tarif pengiriman.");
      }

      const rawRates: ShippingOption[] = Array.isArray(data.rates) ? data.rates : [];
      rawRates.sort((a, b) => (a.cost || 0) - (b.cost || 0));

      setStream((prev) => [
        ...prev,
        {
          id: "res_" + Date.now(),
          type: "rate_result",
          rates: rawRates,
          origin: data.origin || costOrigin.trim(),
          destination: data.destination || costDest.trim(),
          weight: costWeight,
        },
      ]);
    } catch (err) {
      setStream((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          type: "error",
          replyText: err instanceof Error ? err.message : "Gagal memeriksa tarif.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Waybill Tracking
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackAwb.trim() || loading) return;

    const queryDesc = `Lacak ${trackCourier.toUpperCase()} resi ${trackAwb.trim()}`;
    setLoading(true);

    setStream((prev) => [
      ...prev,
      { id: "q_" + Date.now(), type: "query", userText: queryDesc },
    ]);

    try {
      const res = await fetch(`/api/track?courier=${trackCourier}&awb=${encodeURIComponent(trackAwb.trim())}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Nomor resi tidak ditemukan pada ekspedisi tersebut.");
      }

      setStream((prev) => [
        ...prev,
        {
          id: "res_" + Date.now(),
          type: "track_result",
          trackingData: data,
          awb: trackAwb.trim(),
          courier: trackCourier,
        },
      ]);
    } catch (err) {
      setStream((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          type: "error",
          replyText: err instanceof Error ? err.message : "Gagal melacak nomor resi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    sessionIdRef.current = "sess_" + Date.now();
    setStream([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Header />

      {/* Main Wide Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col">
        {/* Editorial Heading */}
        <div className="text-center space-y-3 mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.1]">
            Cek Resi & Tarif Ongkir
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
            Ketik rute tujuan, tempel nomor resi paket, atau tanyakan apa saja seputar pengiriman domestik.
          </p>
        </div>

        {/* Omnibox Floating Container (Wide & Spacious) */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl shadow-zinc-200/30 p-4 sm:p-5 mb-10 transition-all max-w-5xl w-full mx-auto">
          {/* Mode Pill Selectors */}
          <div className="flex items-center gap-2 pb-3.5 border-b border-zinc-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("auto")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "auto"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pencarian Bebas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cost")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "cost"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Form Cek Tarif</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Form Lacak Resi</span>
            </button>
          </div>

          {/* Form Content Depending on Mode */}
          {activeTab === "auto" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAutoSubmit();
              }}
              className="flex items-center gap-3 pt-3 px-2"
            >
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik apa saja, misal: Sokaraja ke Solo 3kg, atau lacak JNE 582230008329223..."
                className="flex-1 text-base sm:text-xl font-medium text-zinc-900 placeholder:text-zinc-400 outline-none bg-transparent"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-11 h-11 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {activeTab === "cost" && (
            <form onSubmit={handleCostSubmit} className="pt-3 px-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Kota Asal</label>
                  <input
                    type="text"
                    value={costOrigin}
                    onChange={(e) => setCostOrigin(e.target.value)}
                    placeholder="Asal (Sokaraja)"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-center pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      const t = costOrigin;
                      setCostOrigin(costDest);
                      setCostDest(t);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Kota Tujuan</label>
                  <input
                    type="text"
                    value={costDest}
                    onChange={(e) => setCostDest(e.target.value)}
                    placeholder="Tujuan (Surakarta)"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Berat (Kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={costWeight}
                    onChange={(e) => setCostWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-semibold text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !costOrigin.trim() || !costDest.trim()}
                  className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  <span>Periksa Tarif</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "track" && (
            <form onSubmit={handleTrackSubmit} className="pt-3 px-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Ekspedisi</label>
                  <select
                    value={trackCourier}
                    onChange={(e) => setTrackCourier(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-semibold text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 cursor-pointer"
                  >
                    {COURIER_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Nomor Resi / AWB</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackAwb}
                      onChange={(e) => setTrackAwb(e.target.value)}
                      placeholder="Masukkan nomor resi..."
                      className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-semibold font-mono text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                    />
                    <button
                      type="submit"
                      disabled={loading || !trackAwb.trim()}
                      className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 whitespace-nowrap shadow-sm"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span>Lacak Resi</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Quick Suggestion Pills (Shown when no stream yet) */}
        {stream.length === 0 && (
          <div className="text-center space-y-3 pt-2 max-w-4xl mx-auto">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contoh pencarian instan:</span>
            <div className="flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={() => handleAutoSubmit("Sokaraja ke Solo 3kg")}
                className="px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs transition-colors"
              >
                Sokaraja ke Solo 3kg
              </button>
              <button
                type="button"
                onClick={() => handleAutoSubmit("Jakarta ke Surabaya 1kg")}
                className="px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs transition-colors"
              >
                Jakarta ke Surabaya 1kg
              </button>
              <button
                type="button"
                onClick={() => handleAutoSubmit("Lacak JNE 582230008329223")}
                className="px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs transition-colors"
              >
                Lacak JNE 582230008329223
              </button>
              <button
                type="button"
                onClick={() => handleAutoSubmit("Kirim paket kargo 50kg murah pakai kurir apa?")}
                className="px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs transition-colors"
              >
                Kirim kargo 50kg pakai apa?
              </button>
            </div>
          </div>
        )}

        {/* Interactive Dynamic Stream of Results (Wide Multi-Column Grid) */}
        {stream.length > 0 && (
          <div className="space-y-8 pt-4 flex-1 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs sm:text-sm text-zinc-500">
              <span className="font-semibold text-zinc-800">Hasil Penelusuran</span>
              <button
                type="button"
                onClick={handleResetSession}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-200/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bersihkan Layar</span>
              </button>
            </div>

            {stream.map((item) => {
              // User Query Bubble
              if (item.type === "query") {
                return (
                  <div key={item.id} className="flex justify-end">
                    <div className="px-6 py-3.5 rounded-2xl bg-zinc-950 text-white text-base sm:text-lg font-medium max-w-2xl shadow-sm">
                      {item.userText}
                    </div>
                  </div>
                );
              }

              // Shipping Rate Result Card (3-4 Columns on Wide Screen!)
              if (item.type === "rate_result" && item.rates) {
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pilihan Tarif Resmi Ekspedisi</span>
                        <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-0.5">
                          {item.origin} &rarr; {item.destination}
                        </h3>
                      </div>
                      <span className="text-xs sm:text-sm font-bold px-4 py-1.5 bg-zinc-100 text-zinc-800 rounded-full self-start sm:self-auto font-mono">
                        {item.weight} Kg
                      </span>
                    </div>

                    {/* Wide Multi-Column Grid for Rates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {item.rates.map((r, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl border border-zinc-200/90 bg-zinc-50/60 hover:bg-white hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono">
                                {r.courier}
                              </span>
                              {r.etd && (
                                <span className="text-[11px] font-bold text-zinc-700 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                                  {r.etd} hari
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-zinc-900 mt-1.5">{r.service}</h4>
                            {r.description && <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{r.description}</p>}
                          </div>

                          <div className="pt-3 border-t border-zinc-200/60 flex items-baseline justify-between">
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Tarif</span>
                            <span className="text-2xl font-black font-mono text-zinc-950">
                              Rp {r.cost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Tracking Result Card (Split Layout on Wide Screens)
              if (item.type === "track_result" && item.trackingData?.data) {
                const data = item.trackingData.data;
                const isDelivered = data.summary?.status?.toUpperCase()?.includes("DELIVERED");

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {data.summary?.courier || item.courier} Express
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-zinc-950 mt-0.5">
                          {item.awb}
                        </h3>
                      </div>

                      <span
                        className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-full self-start sm:self-auto ${
                          isDelivered
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {data.summary?.status || "DALAM PROSES"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Origin/Destination info */}
                      <div className="lg:col-span-4 space-y-4">
                        {(data.detail?.origin || data.detail?.destination) && (
                          <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4 text-sm">
                            <div>
                              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Asal</span>
                              <span className="text-base font-bold text-zinc-900 mt-0.5 block">{data.detail.origin || "-"}</span>
                              {data.detail.shipper && <span className="text-xs text-zinc-500 block mt-1">Pengirim: {data.detail.shipper}</span>}
                            </div>
                            <div className="pt-3 border-t border-zinc-200/60">
                              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Tujuan</span>
                              <span className="text-base font-bold text-zinc-900 mt-0.5 block">{data.detail.destination || "-"}</span>
                              {data.detail.receiver && <span className="text-xs text-zinc-500 block mt-1">Penerima: {data.detail.receiver}</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Chronological Timeline */}
                      <div className="lg:col-span-8 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Linimasa Pengiriman</span>
                        </h4>

                        {Array.isArray(data.history) && data.history.length > 0 ? (
                          <div className="relative pl-6 space-y-5 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                            {data.history.map((h, idx) => (
                              <div key={idx} className="relative">
                                <div
                                  className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                                    idx === 0 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-300"
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-white" : "bg-zinc-300"}`} />
                                </div>
                                <p className={`text-sm sm:text-base ${idx === 0 ? "font-bold text-zinc-950" : "font-medium text-zinc-700"}`}>
                                  {h.note}
                                </p>
                                <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                                  {h.date} {h.city_name ? `• ${h.city_name}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">Belum ada pembaruan linimasa.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Chat Response (Sarah CS)
              if (item.type === "chat_response" && item.replyText) {
                return (
                  <div key={item.id} className="flex gap-3 max-w-3xl animate-in fade-in">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 mt-1 shadow-2xs">
                      <img src={AGENT_AVATAR} alt="Sarah" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-3xl rounded-tl-sm p-6 sm:p-7 text-base leading-relaxed text-zinc-900 shadow-sm whitespace-pre-wrap">
                      <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-zinc-100 text-xs font-bold text-zinc-600">
                        <span>Sarah — Layanan Ekspedisi Obrool</span>
                      </div>
                      {item.replyText}
                    </div>
                  </div>
                );
              }

              // Error notification
              if (item.type === "error" && item.replyText) {
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{item.replyText}</span>
                  </div>
                );
              }

              return null;
            })}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-zinc-500 p-4">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                <span>Sedang memeriksa data ekspedisi...</span>
              </div>
            )}

            <div ref={streamEndRef} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
