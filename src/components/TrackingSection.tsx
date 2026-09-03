"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, Clock, MapPin, AlertCircle, ArrowRight } from "lucide-react";

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
      {/* Form Input */}
      <form onSubmit={handleTrack} className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Select Kurir */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Pilih Ekspedisi</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:bg-white focus:border-blue-600 transition-all cursor-pointer"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Resi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Nomor Resi / AWB</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Contoh: 582230008329223, JP1234567890"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading || !awb.trim()}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Lacak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Sample Numbers */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[0.6875rem] text-zinc-400 font-medium">Contoh nomor resi:</span>
          <button
            type="button"
            onClick={() => {
              setCourier("jne");
              setAwb("582230008329223");
            }}
            className="text-[0.6875rem] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md font-mono transition-colors"
          >
            JNE: 582230008329223
          </button>
          <button
            type="button"
            onClick={() => {
              setCourier("jnt");
              setAwb("JP1234567890");
            }}
            className="text-[0.6875rem] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md font-mono transition-colors"
          >
            J&T: JP1234567890
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800 leading-relaxed">
            <span className="font-semibold block mb-0.5">Informasi Resi Belum Ditemukan</span>
            {error}
          </div>
        </div>
      )}

      {/* Result Card */}
      {result?.data && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                  {result.data.summary?.courier} Express
                </span>
                <span
                  className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded-full ${
                    isDelivered
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {result.data.summary?.status || "DALAM PROSES"}
                </span>
              </div>
              <h3 className="text-lg font-bold font-mono text-zinc-900">{awb}</h3>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-600">
              {result.data.detail?.origin && (
                <div>
                  <span className="text-zinc-400 block text-[0.6875rem]">Asal</span>
                  <span className="font-semibold text-zinc-800">{result.data.detail.origin}</span>
                </div>
              )}
              {result.data.detail?.destination && (
                <div>
                  <span className="text-zinc-400 block text-[0.6875rem]">Tujuan</span>
                  <span className="font-semibold text-zinc-800">{result.data.detail.destination}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Riwayat Perjalanan Paket</span>
            </h4>

            {Array.isArray(result.data.history) && result.data.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                {result.data.history.map((item, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                          isLatest
                            ? "bg-blue-600 border-blue-200 text-white shadow-sm"
                            : "bg-white border-zinc-300 text-zinc-400"
                        }`}
                      >
                        {isLatest ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isLatest ? "text-blue-600 font-semibold" : "text-zinc-800"
                            }`}
                          >
                            {item.note}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[0.6875rem] text-zinc-400 font-mono">
                          <span>{item.date}</span>
                          {item.city_name && <span>• {item.city_name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">Belum ada pembaruan linimasa dari pihak ekspedisi.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
