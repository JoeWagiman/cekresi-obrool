export function Footer() {
  return (
    <footer className="mt-auto py-10 border-t border-zinc-200/80 text-xs text-zinc-400 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/brand/mark.svg" alt="Obrool" className="w-4 h-4 opacity-70" />
          <p>© {new Date().getFullYear()} Obrool. Layanan cek resi & estimasi tarif logistik.</p>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 font-medium">
          <a href="https://obrool.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors">
            Tentang Obrool
          </a>
        </div>
      </div>
    </footer>
  );
}
