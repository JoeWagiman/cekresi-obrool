"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRightLeft, DollarSign, Clock, AlertCircle } from "lucide-react";

interface CostItem {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export function ShippingRateSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState<CostItem[]>([]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setError("");
    setRates([]);

    try {
      const res = await fetch("/api/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.trim(),
          destination: destination.trim(),
          weight: parseFloat(weight) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mendapatkan estimasi tarif ongkos kirim.");
      }

      setRates(data.data?.costs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memeriksa tarif.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="space-y-6">
      {/* Form Input */}
      <form onSubmit={handleCalculate} className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Asal */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Kota / Kecamatan Asal</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Contoh: Sokaraja, Banyumas"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          {/* Swap button */}
          <div className="sm:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Tukar Asal & Tujuan"
              className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Tujuan */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Kota / Kecamatan Tujuan</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Contoh: Surakarta, Solo"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          {/* Berat (kg) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Berat (Kg)</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          {/* Quick Route Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-zinc-500">
            <span>Rute populer:</span>
            <button
              type="button"
              onClick={() => {
                setOrigin("Purwokerto");
                setDestination("Jakarta");
                setWeight("1");
              }}
              className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors"
            >
              Purwokerto &rarr; Jakarta
            </button>
            <button
              type="button"
              onClick={() => {
                setOrigin("Surabaya");
                setDestination("Medan");
                setWeight("2");
              }}
              className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors"
            >
              Surabaya &rarr; Medan
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !origin.trim() || !destination.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Cek Tarif Ongkir</span>
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Pemberitahuan Pengecekan Tarif</span>
            {error}
          </div>
        </div>
      )}

      {/* Rates Table */}
      {rates.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Pilihan Tarif Pengiriman ({origin} &rarr; {destination}, {weight} kg)
              </h3>
              <p className="text-xs text-zinc-400">Diurutkan dari tarif paling hemat ke ekspres</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              {rates.length} Opsi Layanan
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {rates.map((item, idx) => {
              const isCheapest = idx === 0;
              return (
                <div
                  key={idx}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 rounded-xl transition-colors ${
                    isCheapest ? "bg-blue-50/40 border border-blue-100" : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 bg-zinc-900 text-white rounded">
                        {item.courier}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">{item.service}</span>
                      {isCheapest && (
                        <span className="text-[0.625rem] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-full">
                          Paling Hemat
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                    <div className="text-sm font-bold text-zinc-900 font-mono">
                      Rp {item.cost.toLocaleString("id-ID")}
                    </div>
                    {item.etd && (
                      <div className="flex items-center gap-1 text-[0.6875rem] text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.etd} hari kerja</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
