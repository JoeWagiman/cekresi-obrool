import Link from "next/link";
import { Package, Sparkles, ExternalLink } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-900 leading-tight flex items-center gap-1.5">
              CekResi<span className="text-blue-600">.id</span>
              <span className="text-[0.625rem] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200">
                AI Powered
              </span>
            </span>
            <span className="text-[0.6875rem] text-zinc-600 font-medium">
              Portal Cek Resi & Tarif Ongkir Ekspedisi
            </span>
          </div>
        </Link>

        {/* Navigation & CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <span>Powered by Obrool</span>
          </a>
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pasang Bot di Toko Anda</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
