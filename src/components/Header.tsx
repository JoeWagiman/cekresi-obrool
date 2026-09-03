import Link from "next/link";
import { Package2, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Package2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 tracking-tight leading-tight">
              Cek Resi & Ongkir
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              by Obrool
            </span>
          </div>
        </Link>

        {/* Action Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            obrool.com
          </a>
        </div>
      </div>
    </header>
  );
}
