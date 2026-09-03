export function Footer() {
  return (
    <footer className="mt-auto py-10 border-t border-zinc-100 text-xs text-zinc-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Obrool. Layanan cek resi & estimasi tarif logistik.</p>
        <div className="flex items-center gap-4 text-zinc-600 font-medium">
          <a href="https://obrool.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors">
            Tentang Obrool
          </a>
        </div>
      </div>
    </footer>
  );
}
