import { Sparkles, MessageSquare, Bot, ArrowRight, Zap, Check } from "lucide-react";

export function GrowthCta() {
  const benefits = [
    "Cek resi & ongkir otomatis di WhatsApp 24 jam nonstop",
    "Bebaskan admin toko dari pertanyaan berulang 'Min resi berapa?'",
    "Integrasi instan dengan data produk & SOP tokomu",
    "Tersedia gratis tanpa kartu kredit",
  ];

  return (
    <div className="mt-16 bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-xs font-semibold text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Untuk Pemilik Toko Online & UMKM</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          Capek Balas Chat <span className="text-blue-400">"Min Resi Berapa?"</span> Setiap Hari? Pasang Bot CekResi di Toko Anda!
        </h2>

        <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
          Tingkatkan kepuasan pembeli dan otomatisasi operasional toko Anda. Hubungkan asisten AI logistik cerdas ke WhatsApp & Website toko Anda dalam hitungan 2 menit bersama <strong>Obrool</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Buat Bot Toko Gratis di Obrool</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://obrool.com/#fitur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-sm transition-colors border border-white/10"
          >
            <span>Pelajari Cara Kerja</span>
          </a>
        </div>
      </div>
    </div>
  );
}
