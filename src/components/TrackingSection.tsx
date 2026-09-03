"use client";

import { useState } from "react";
import { Search, Loader2, Clock, AlertCircle } from "lucide-react";

interface ManifestItem {
  note: string;
  date: string;
  city_name?: string;
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
    history?: ManifestItem[];
  };
}

export function TrackingSection() {
  const [courier, setCourier] = useState("jne");
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingData | null>(null);

  const couriers = [
    { id: "jne", name: "JNE Express" },
    { id: "jnt", name: "J&T Express" },
    { id: "sicepat", name: "SiCepat" },
    { id: "pos", name: "POS Indonesia" },
    { id: "anteraja", name: "Anteraja" },
    { id: "wahana", name: "Wahana" },
    { id: "lion", name: "Lion Parcel" },
    { id: "tiki", name: "TIKI" },
    { id: "ninja", name: "Ninja Xpress" },
    { id: "ide", name: "ID Express" },
  ];

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track?courier=${courier}&awb=${encodeURIComponent(awb.trim())}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Nomor resi tidak ditemukan atau belum terupdate oleh kurir.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat melacak paket.");
    } finally {
      setLoading(false);
    }
  };

  const isDelivered = result?.data?.summary?.status?.toUpperCase()?.includes("DELIVERED");

  return (
    <div className="space-y-6">
      {/* Form Input with Large Typography */}
      <form onSubmit={handleTrack} className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Select Kurir */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Ekspedisi
            </label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base font-semibold text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 transition-all cursor-pointer"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Resi */}
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Nomor Resi / AWB
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Masukkan nomor resi..."
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 transition-all font-mono font-medium"
              />
              <button
                type="submit"
                disabled={loading || !awb.trim()}
                className="px-6 sm:px-8 py-3.5 bg-zinc-900 hover:bg-black text-white font-semibold rounded-xl text-sm sm:text-base transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>Lacak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-zinc-400">Contoh:</span>
          <button
            type="button"
            onClick={() => {
              setCourier("jne");
              setAwb("582230008329223");
            }}
            className="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-mono transition-colors"
          >
            JNE: 582230008329223
          </button>
          <button
            type="button"
            onClick={() => {
              setCourier("jnt");
              setAwb("JP1234567890");
            }}
            className="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-mono transition-colors"
          >
            J&T: JP1234567890
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 flex items-start gap-3.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 leading-relaxed">
            <span className="font-bold block mb-0.5 text-base">Informasi Tidak Ditemukan</span>
            {error}
          </div>
        </div>
      )}

      {/* Result Card */}
      {result?.data && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          {/* Header Summary with Bold Big Type */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">
                {result.data.summary?.courier} Express
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 mt-0.5">
                {awb}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full ${
                  isDelivered
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-zinc-100 text-zinc-900 border border-zinc-300"
                }`}
              >
                {result.data.summary?.status || "DALAM PROSES"}
              </span>
            </div>
          </div>

          {/* Origin & Destination Display */}
          {(result.data.detail?.origin || result.data.detail?.destination) && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 text-sm">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Asal</span>
                <span className="text-base font-bold text-zinc-900 mt-0.5 block">{result.data.detail.origin || "-"}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Tujuan</span>
                <span className="text-base font-bold text-zinc-900 mt-0.5 block">{result.data.detail.destination || "-"}</span>
              </div>
            </div>
          )}

          {/* Timeline Tracking */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-700" />
              <span>Riwayat Perjalanan Paket</span>
            </h4>

            {Array.isArray(result.data.history) && result.data.history.length > 0 ? (
              <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                {result.data.history.map((item, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isLatest
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                            : "bg-white border-zinc-300 text-zinc-400"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isLatest ? "bg-white" : "bg-zinc-300"}`} />
                      </div>

                      <div className="space-y-1">
                        <p className={`text-sm sm:text-base ${isLatest ? "font-bold text-zinc-900" : "font-medium text-zinc-700"}`}>
                          {item.note}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                          <span>{item.date}</span>
                          {item.city_name && <span>• {item.city_name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic">Belum ada pembaruan linimasa dari pihak ekspedisi.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
