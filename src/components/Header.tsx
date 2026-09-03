import Link from "next/link";
import { Package } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
            <Package className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">Cek Resi & Ongkir</span>
            <span className="text-xs text-zinc-400 font-normal">by Obrool</span>
          </div>
        </Link>

        <a
          href="https://obrool.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          obrool.com
        </a>
      </div>
    </header>
  );
}
