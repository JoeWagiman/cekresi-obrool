export interface LocationGeo {
  city?: string;
  region?: string;
}

export function generateLogisticsSuggestions(geo?: LocationGeo, shuffleIndex: number = 0): string[] {
  const city = geo?.city?.trim() || "Purwokerto";
  const targetOtherCity1 = city.toLowerCase().includes("surabaya") ? "Semarang" : "Surabaya";
  const targetOtherCity2 = city.toLowerCase().includes("jakarta") ? "Bandung" : "Jakarta";
  const targetOtherCity3 = city.toLowerCase().includes("denpasar") ? "Yogyakarta" : "Denpasar Bali";

  const questionSets: string[][] = [
    [
      `Cek ongkir dari ${city} ke ${targetOtherCity1} 2 kg`,
      `Ongkir dari ${targetOtherCity2} ke ${city} 1 kg`,
      "Lacak paket JNE 582230008329223",
    ],
    [
      `Pengiriman dari ${city} ke ${targetOtherCity3} 5 kg`,
      "Lacak paket SiCepat 004123456789",
      `Kirim paket dari Bandung ke ${city} 3 kg`,
    ],
    [
      "Pengiriman dari Tobong Purbalingga ke Kesugihan Cilacap 5 kg",
      "Cek ongkir dari Sokaraja Banyumas ke Balamoa Tegal 2 kg",
      "Lacak paket J&T JP1234567890",
    ],
    [
      `Berapa ongkir dari ${city} ke Medan 2 kg?`,
      `Tarif kirim dari ${city} ke Makassar 10 kg`,
      "Lacak paket POS Indonesia 12345678901",
    ],
    [
      `Ongkir dari ${city} ke Yogyakarta 1 kg`,
      `Kirim barang dari Semarang ke ${city} 4 kg`,
      "Lacak resi Wahana 9988776655",
    ],
    [
      "Cek tarif kargo dari Jakarta ke Balikpapan 20 kg",
      `Ongkir Ninja Xpress dari ${city} ke Malang 2 kg`,
      "Cek resi Anteraja 100023456789",
    ],
  ];

  const safeIndex = Math.abs(shuffleIndex) % questionSets.length;
  return questionSets[safeIndex];
}
