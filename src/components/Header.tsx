import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-black bg-[#F4F4F0] text-black font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        {/* Brand Industrial Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-black text-white px-2 py-0.5 font-bold tracking-widest text-[11px]">
            OBROOL
          </div>
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-zinc-800">
            <span>MANIFEST // EKSPEDISI</span>
            <span className="hidden sm:inline text-zinc-400 font-normal">[ID-LOGISTICS]</span>
          </div>
        </Link>

        {/* System Telemetry & External Link */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden md:flex items-center gap-2 text-zinc-600">
            <span className="w-2 h-2 bg-emerald-600 rounded-none inline-block animate-pulse" />
            <span className="font-semibold">SYS.STATUS: OPERATIONAL</span>
          </div>

          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-black px-2.5 py-1 font-bold hover:bg-black hover:text-white transition-colors tracking-wider"
          >
            OBROOL.COM &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}
