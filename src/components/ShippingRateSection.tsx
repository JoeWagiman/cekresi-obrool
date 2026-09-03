"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRightLeft, AlertCircle, ArrowUpRight } from "lucide-react";

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
  const [weight, setWeight] = useState("1");
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
        throw new Error(data.error || "Gagal mendapatkan informasi tarif pengiriman.");
      }

      const rawRates: ShippingOption[] = Array.isArray(data.rates) ? data.rates : [];
      rawRates.sort((a, b) => (a.cost || 0) - (b.cost || 0));

      setRates(rawRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memeriksa tarif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form with Large Inputs */}
      <form onSubmit={handleCalculate} className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Origin */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Kecamatan / Kota Asal
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Misal: Sokaraja / Banyumas"
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-lg font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-2 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-200/70 text-zinc-700 transition-colors shadow-2xs"
              title="Tukar rute"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Kecamatan / Kota Tujuan
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Misal: Surakarta / Solo"
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-lg font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Row 2: Weight & Submit */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Berat Paket (Kg)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-lg font-mono font-semibold text-zinc-900 outline-none focus:bg-white focus:border-zinc-900 transition-all"
            />
          </div>

          <div className="sm:col-span-8">
            <button
              type="submit"
              disabled={loading || !origin.trim() || !destination.trim()}
              className="w-full py-3.5 px-6 bg-zinc-900 hover:bg-black text-white font-semibold rounded-xl text-sm sm:text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>Periksa Tarif Pengiriman</span>
            </button>
          </div>
        </div>

        {/* Quick routes */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
          <span className="text-zinc-400">Rute cepat:</span>
          <button
            type="button"
            onClick={() => {
              setOrigin("Sokaraja");
              setDestination("Surakarta");
              setWeight("3");
            }}
            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors font-medium"
          >
            Sokaraja &rarr; Surakarta (3 kg)
          </button>
          <button
            type="button"
            onClick={() => {
              setOrigin("Jakarta");
              setDestination("Surabaya");
              setWeight("1");
            }}
            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors font-medium"
          >
            Jakarta &rarr; Surabaya (1 kg)
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 flex items-start gap-3.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 leading-relaxed">
            <span className="font-bold block mb-0.5 text-base">Gagal Mendapatkan Tarif</span>
            {error}
          </div>
        </div>
      )}

      {/* Rates Table / Cards with Bold Big Typography */}
      {rates.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Hasil Simulasi</span>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
                {origin} &rarr; {destination}
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full font-mono">
              {weight} Kg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {rates.map((r, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                      {r.courier}
                    </span>
                    {r.etd && (
                      <span className="text-xs font-mono font-medium text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">
                        {r.etd} hari
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 mt-1">
                    {r.service}
                  </h4>
                  {r.description && (
                    <p className="text-xs text-zinc-500 line-clamp-1">{r.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200/60 flex items-baseline justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Tarif</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-zinc-900">
                    Rp {r.cost.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
