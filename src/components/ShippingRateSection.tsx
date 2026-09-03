"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRightLeft } from "lucide-react";

interface ShippingOption {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export function ShippingRateSection() {
  const [origin, setOrigin] = useState("Sokaraja");
  const [destination, setDestination] = useState("Surakarta");
  const [weight, setWeight] = useState("3");
  const [courier, setCourier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState<ShippingOption[]>([]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setError("");
    setRates([]);

    try {
      const weightNum = parseFloat(weight) || 1;
      const weightGrams = Math.round(weightNum * 1000);

      const params = new URLSearchParams({
        origin: origin.trim(),
        destination: destination.trim(),
        weight: String(weightGrams),
      });

      if (courier) {
        params.append("courier", courier);
      }

      const res = await fetch(`/api/cost?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "GAGAL MEMUAT DATA TARIF DARI GATEWAY.");
      }

      const rawRates: ShippingOption[] = Array.isArray(data.rates) ? data.rates : [];
      rawRates.sort((a, b) => (a.cost || 0) - (b.cost || 0));

      setRates(rawRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "TERJADI GANGGUAN PADA KALKULASI TARIF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Route & Weight Matrix Terminal */}
      <form onSubmit={handleCalculate} className="border-2 border-black bg-white p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3 text-xs">
          <span className="font-black tracking-widest bg-black text-white px-2 py-0.5">
            FREIGHT_RATE // SIMULATOR
          </span>
          <span className="text-zinc-500 font-bold hidden sm:inline">RUTE ASAL - TUJUAN & BERAT</span>
        </div>

        {/* Route Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              [01] KECAMATAN / KOTA ASAL:
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="MISAL: SOKARAJA"
              className="w-full px-4 py-3 bg-zinc-50 border-2 border-black text-base sm:text-lg font-black tracking-wider text-black uppercase outline-none focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 border-2 border-black bg-zinc-100 hover:bg-black hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
              title="Tukar rute"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              [02] KECAMATAN / KOTA TUJUAN:
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="MISAL: SURAKARTA"
              className="w-full px-4 py-3 bg-zinc-50 border-2 border-black text-base sm:text-lg font-black tracking-wider text-black uppercase outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Weight & Action */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              [03] BERAT (KG):
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border-2 border-black text-base sm:text-lg font-black text-black outline-none focus:bg-white"
            />
          </div>

          <div className="sm:col-span-8">
            <button
              type="submit"
              disabled={loading || !origin.trim() || !destination.trim()}
              className="w-full py-3.5 px-6 bg-black hover:bg-zinc-800 text-white font-black text-sm tracking-wider uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-2 border-2 border-black active:translate-x-0.5 active:translate-y-0.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>HITUNG TARIF ONGKIR</span>
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-400 font-bold">PRESET:</span>
          <button
            type="button"
            onClick={() => {
              setOrigin("Sokaraja");
              setDestination("Surakarta");
              setWeight("3");
            }}
            className="underline hover:bg-black hover:text-white px-1 font-semibold"
          >
            Sokaraja &rarr; Surakarta (3kg)
          </button>
          <button
            type="button"
            onClick={() => {
              setOrigin("Jakarta");
              setDestination("Surabaya");
              setWeight("1");
            }}
            className="underline hover:bg-black hover:text-white px-1 font-semibold"
          >
            Jakarta &rarr; Surabaya (1kg)
          </button>
        </div>
      </form>

      {/* Error Stamp */}
      {error && (
        <div className="border-2 border-black bg-red-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <div className="font-black text-xs text-red-600 tracking-widest">[ERR: CALCULATION_FAILED]</div>
          <p className="text-sm font-bold text-black uppercase">{error}</p>
        </div>
      )}

      {/* Thermal Freight Quotation Board */}
      {rates.length > 0 && (
        <div className="border-2 border-black bg-[#FFFEFA] p-6 sm:p-9 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                OFFICIAL RATE SHEET // {rates.length} LAYANAN TERSEDIA
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-black uppercase mt-0.5">
                {origin} &rarr; {destination}
              </h2>
            </div>
            <div className="bg-black text-white px-3 py-1 text-xs font-black self-start sm:self-auto">
              MASS: {weight} KG
            </div>
          </div>

          {/* Tabular Rate Manifest */}
          <div className="border border-black divide-y divide-black bg-white">
            {rates.map((r, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-900 text-white text-[10px] font-black px-1.5 py-0.5 tracking-wider uppercase">
                      {r.courier}
                    </span>
                    {r.etd && (
                      <span className="text-[11px] font-bold text-zinc-600 border border-zinc-300 px-1.5 py-0.5">
                        ETA: {r.etd} HARI
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-wide">
                    {r.service}
                  </h3>
                  {r.description && (
                    <p className="text-xs text-zinc-500 uppercase">{r.description}</p>
                  )}
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 border-zinc-200 pt-2 sm:pt-0">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">HARGA RESMI</div>
                  <div className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                    RP {r.cost.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thermal Perforation */}
          <div className="pt-4 border-t-2 border-dashed border-zinc-400 flex items-center justify-between text-[10px] text-zinc-400 font-bold">
            <span>--- QUOTATION SHEET // VERIFIED ---</span>
            <span>RATES BY COURIER DIRECT</span>
          </div>
        </div>
      )}
    </div>
  );
}
