import Link from "next/link";
import { Package, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const couriers = [
    "JNE Express",
    "J&T Express",
    "SiCepat Ekspres",
    "POS Indonesia",
    "Anteraja",
    "Wahana Prestasi Logistik",
    "Lion Parcel",
    "TIKI",
    "Ninja Xpress",
    "ID Express",
    "Sentral Cargo",
    "J&T Cargo",
  ];

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 mt-20 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-zinc-900">CekResi.id</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Layanan pelacakan resi instan dan kalkulator ongkos kirim resmi multi-ekspedisi Indonesia yang didukung teknologi AI Customer Service cerdas dari Obrool.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data tarif resmi terhubung langsung ke sistem ekspedisi.</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Kurir Didukung</h4>
            <div className="grid grid-cols-2 gap-1.5 text-[0.75rem] text-zinc-600">
              {couriers.map((c) => (
                <span key={c} className="hover:text-zinc-900 transition-colors">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Untuk Pemilik Toko</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Otomasi layanan pelanggan toko online Anda dengan AI Bot WhatsApp yang siap cek resi dan ongkir 24 jam nonstop.
            </p>
            <a
              href="https://obrool.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Mulai Gratis di Obrool.com &rarr;
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} CekResi.id. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Ditenagai dengan bangga oleh</span>
            <a
              href="https://obrool.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 hover:underline"
            >
              Obrool.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
