export function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-20 py-8 bg-white text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Obrool. Layanan cek resi & estimasi ongkir pengiriman.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Tentang Obrool
          </a>
        </div>
      </div>
    </footer>
  );
}
