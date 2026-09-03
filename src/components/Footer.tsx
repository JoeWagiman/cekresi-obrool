export function Footer() {
  return (
    <footer className="border-t-2 border-dashed border-zinc-300 mt-20 pt-8 pb-12 font-mono text-[11px] text-zinc-500 bg-[#F4F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-200 text-black px-1.5 py-0.5 font-bold">TERM:01</span>
            <span className="font-semibold text-zinc-700">INDONESIAN DOMESTIC LOGISTICS MANIFEST</span>
          </div>
          <div className="text-zinc-400">
            LOC: ASIA/JAKARTA (WIB) // PROTOCOL: HTTP-REST
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <p>© {new Date().getFullYear()} OBROOL LOGISTICS ENGINE. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-black font-bold">
            <a href="https://obrool.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              [ OBROOL.COM ]
            </a>
            <a href="https://obrool.com/#fitur" target="_blank" rel="noopener noreferrer" className="hover:underline">
              [ API DOCS ]
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
