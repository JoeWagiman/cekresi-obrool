"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";

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
    { id: "jne", name: "JNE" },
    { id: "jnt", name: "J&T" },
    { id: "sicepat", name: "SICEPAT" },
    { id: "pos", name: "POS" },
    { id: "anteraja", name: "ANTERAJA" },
    { id: "wahana", name: "WAHANA" },
    { id: "lion", name: "LION" },
    { id: "tiki", name: "TIKI" },
    { id: "ninja", name: "NINJA" },
    { id: "ide", name: "ID_EXP" },
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
        throw new Error(data.error || "RESI TIDAK DITEMUKAN PADA GATEWAY EKSPEDISI.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GAGAL MENGHUBUNGI GATEWAY PELACAKAN.");
    } finally {
      setLoading(false);
    }
  };

  const isDelivered = result?.data?.summary?.status?.toUpperCase()?.includes("DELIVERED");

  return (
    <div className="space-y-6 font-mono">
      {/* Industrial Search Terminal */}
      <form onSubmit={handleTrack} className="border-2 border-black bg-white p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3 text-xs">
          <span className="font-black tracking-widest bg-black text-white px-2 py-0.5">
            MANIFEST_LOOKUP // INQUIRY
          </span>
          <span className="text-zinc-500 font-bold hidden sm:inline">INPUT RESI & PILIH KURIR</span>
        </div>

        {/* Courier Selector Grid */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            [01] PILIH OPERATOR KURIR:
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {couriers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCourier(c.id)}
                className={`py-2 px-1 text-center text-xs font-black border transition-all ${
                  courier === c.id
                    ? "bg-black text-white border-black"
                    : "bg-zinc-50 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Barcode / AWB */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            [02] NOMOR WAYBILL / AIRWAY BILL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value.toUpperCase())}
              placeholder="CONTOH: 582230008329223"
              className="flex-1 px-4 py-3.5 bg-zinc-50 border-2 border-black text-lg sm:text-xl font-black tracking-wider text-black placeholder:text-zinc-400 outline-none focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !awb.trim()}
              className="px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-black text-sm tracking-wider uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-2 border-2 border-black active:translate-x-0.5 active:translate-y-0.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>LACAK RESI</span>
            </button>
          </div>
        </div>

        {/* Preset Shortcuts */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-400 font-bold">PRESET:</span>
          <button
            type="button"
            onClick={() => {
              setCourier("jne");
              setAwb("582230008329223");
            }}
            className="underline hover:bg-black hover:text-white px-1 font-semibold"
          >
            JNE: 582230008329223
          </button>
          <button
            type="button"
            onClick={() => {
              setCourier("jnt");
              setAwb("JP1234567890");
            }}
            className="underline hover:bg-black hover:text-white px-1 font-semibold"
          >
            J&T: JP1234567890
          </button>
        </div>
      </form>

      {/* Error Stamp */}
      {error && (
        <div className="border-2 border-black bg-red-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="font-black text-xs text-red-600 tracking-widest">[ERR: LOOKUP_FAILED]</div>
          <p className="text-sm font-bold text-black uppercase">{error}</p>
        </div>
      )}

      {/* The Physical Thermal Waybill Manifest */}
      {result?.data && (
        <div className="border-2 border-black bg-[#FFFEFA] p-6 sm:p-9 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden space-y-6">
          {/* Decorative Barcode Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-5">
            <div>
              {/* Pseudo SVG Barcode */}
              <div className="flex items-center gap-[2px] h-9 mb-3 opacity-90">
                {[4, 2, 6, 1, 3, 5, 2, 8, 2, 4, 1, 6, 3, 2, 5, 1, 4, 7, 2, 3, 5, 1, 3, 6, 2, 4, 1].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>

              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                WAYBILL ID // {result.data.summary?.courier || courier}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black mt-0.5 font-mono">
                {awb}
              </h2>
            </div>

            {/* Industrial Stamp */}
            <div className="border-2 border-black px-4 py-2 text-center self-start sm:self-auto rotate-[-1deg]">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">STATUS MANIFEST</div>
              <div className={`text-base font-black tracking-wider ${isDelivered ? "text-emerald-700" : "text-black"}`}>
                [ {result.data.summary?.status || "IN_TRANSIT"} ]
              </div>
            </div>
          </div>

          {/* Route Matrix */}
          {(result.data.detail?.origin || result.data.detail?.destination) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-black p-4 bg-zinc-50">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">LOKASI ASAL:</span>
                <span className="text-lg font-black text-black block mt-0.5 uppercase">
                  {result.data.detail.origin || "N/A"}
                </span>
                {result.data.detail.shipper && (
                  <span className="text-xs text-zinc-600 block mt-1">PENGIRIM: {result.data.detail.shipper}</span>
                )}
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-black sm:pl-4 pt-3 sm:pt-0">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">LOKASI TUJUAN:</span>
                <span className="text-lg font-black text-black block mt-0.5 uppercase">
                  {result.data.detail.destination || "N/A"}
                </span>
                {result.data.detail.receiver && (
                  <span className="text-xs text-zinc-600 block mt-1">PENERIMA: {result.data.detail.receiver}</span>
                )}
              </div>
            </div>
          )}

          {/* Chronological Teletype Dispatch Log */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="font-black text-xs tracking-widest uppercase">
                [ DISPATCH_TELEMETRY // LOGS ]
              </span>
              <span className="text-[11px] text-zinc-500 font-bold">
                {result.data.history?.length || 0} PERISTIWA TERCATAT
              </span>
            </div>

            {Array.isArray(result.data.history) && result.data.history.length > 0 ? (
              <div className="space-y-3 pt-2 font-mono">
                {result.data.history.map((item, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 border transition-all ${
                        isLatest
                          ? "bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
                          : "bg-white text-black border-zinc-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mb-1.5 opacity-80">
                        <span className="font-black tracking-wider">
                          LOG #{String(result.data?.history?.length ? result.data.history.length - idx : idx).padStart(2, "0")}
                        </span>
                        <span>{item.date} {item.city_name ? `// ${item.city_name.toUpperCase()}` : ""}</span>
                      </div>
                      <p className={`text-xs sm:text-sm uppercase tracking-wide ${isLatest ? "font-black" : "font-semibold"}`}>
                        {item.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-zinc-400 text-xs text-zinc-500 uppercase">
                BELUM ADA CATATAN PERISTIWA DARI GATEWAY KURIR.
              </div>
            )}
          </div>

          {/* Bottom Receipt Perforation Line */}
          <div className="pt-6 border-t-2 border-dashed border-zinc-400 flex items-center justify-between text-[10px] text-zinc-400 font-bold">
            <span>--- END OF MANIFEST PRINTOUT ---</span>
            <span>SECURE-HASH // BINDERBYTE-GW</span>
          </div>
        </div>
      )}
    </div>
  );
}
