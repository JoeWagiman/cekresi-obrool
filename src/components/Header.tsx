import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Prominent Logo Mark + Brand Text */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/brand/mark.svg"
            alt="Obrool Logo"
            className="w-9 h-9 flex-shrink-0 transition-transform group-hover:scale-105"
          />
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-zinc-950">
              obrool
            </span>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase hidden sm:inline">
              / Cek Resi & Ongkir
            </span>
          </div>
        </Link>

        {/* Navigation Link */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400 font-medium hidden md:inline">
            Portal Logistik Resmi
          </span>
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
          >
            obrool.com &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}
