/**
 * Obrool Logistics Typo Mitigation & Indonesian Slang Normalizer
 * Menangani singkatan kota (pwt, sby, jkt, jogja), typo fonetik (surbya, manokwri, makasar),
 * dan fuzzy matching (Levenshtein Distance) untuk nama wilayah ekspedisi.
 */

// 1. Kamus Slang, Singkatan Populer & Typo Umum Kota/Wilayah Indonesia
export const CITY_ALIAS_MAP: Record<string, string> = {
  // Jabodetabek & Banten
  jkt: "Jakarta",
  jaksel: "Jakarta Selatan",
  jaktim: "Jakarta Timur",
  jakbar: "Jakarta Barat",
  jakpus: "Jakarta Pusat",
  jakut: "Jakarta Utara",
  jakart: "Jakarta",
  bgr: "Bogor",
  dpk: "Depok",
  tgr: "Tangerang",
  tangsel: "Tangerang Selatan",
  bks: "Bekasi",
  btn: "Banten",
  crb: "Cirebon",
  skb: "Sukabumi",

  // Jawa Barat
  bdg: "Bandung",
  bandug: "Bandung",
  cmi: "Cimahi",
  tsm: "Tasikmalaya",
  grt: "Garut",

  // Jawa Tengah & DIY
  smg: "Semarang",
  semrang: "Semarang",
  solo: "Surakarta",
  sl: "Surakarta",
  slo: "Surakarta",
  jogja: "Yogyakarta",
  yogya: "Yogyakarta",
  yk: "Yogyakarta",
  pwt: "Purwokerto",
  purwokrto: "Purwokerto",
  pbg: "Purbalingga",
  purbalinga: "Purbalingga",
  clcp: "Cilacap",
  kbm: "Kebumen",
  bms: "Banyumas",
  banyumass: "Banyumas",
  skr: "Sokaraja",
  teg: "Tegal",
  pml: "Pemalang",
  pkln: "Pekalongan",
  kds: "Kudus",
  mgl: "Magelang",
  klt: "Klaten",
  skt: "Salatiga",
  byll: "Boyolali",
  srgn: "Sragen",

  // Jawa Timur & Bali & NTB/NTT
  sby: "Surabaya",
  surbya: "Surabaya",
  surbaya: "Surabaya",
  surabayaa: "Surabaya",
  mlg: "Malang",
  sda: "Sidoarjo",
  jbr: "Jember",
  bwi: "Banyuwangi",
  kdr: "Kediri",
  mdo: "Madiun",
  bali: "Denpasar",
  dps: "Denpasar",
  denpsar: "Denpasar",
  denpasr: "Denpasar",
  mtm: "Mataram",
  lombok: "Mataram",
  kpg: "Kupang",

  // Sumatera
  mdn: "Medan",
  plg: "Palembang",
  plembang: "Palembang",
  pdg: "Padang",
  pku: "Pekanbaru",
  bth: "Batam",
  ach: "Banda Aceh",
  aceh: "Banda Aceh",
  jmb: "Jambi",
  bgl: "Bengkulu",
  bnd: "Bandar Lampung",
  lampung: "Bandar Lampung",
  tpi: "Tanjungpinang",

  // Kalimantan
  bpp: "Balikpapan",
  balikpapn: "Balikpapan",
  smd: "Samarinda",
  ptk: "Pontianak",
  pontiank: "Pontianak",
  bdj: "Banjarmasin",
  bjm: "Banjarmasin",
  pkg: "Palangkaraya",
  trkn: "Tarakan",

  // Sulawesi & Maluku & Papua
  mks: "Makassar",
  makasar: "Makassar",
  mnc: "Manado",
  mnd: "Manado",
  kdi: "Kendari",
  amb: "Ambon",
  trn: "Ternate",
  jpr: "Jayapura",
  mnk: "Manokwari",
  manokwri: "Manokwari",
  sor: "Sorong",
  mra: "Merauke",
  tim: "Timika",
};

// Daftar referensi kota-kota utama untuk fuzzy match
const MAJOR_CITIES: string[] = Array.from(new Set(Object.values(CITY_ALIAS_MAP)));

/**
 * Hitung Jarak Levenshtein antara dua string (berapa huruf yang perlu diedit/disisipkan/dihapus)
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];

  for (let i = 0; i <= an; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bn; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[an][bn];
}

/**
 * Koreksi typo atau singkatan kota/wilayah:
 * 1. Cek langsung ke kamus alias (O(1))
 * 2. Cek variasi kata per kata jika input multi-kata
 * 3. Cek fuzzy matching jika panjang kata >= 5 dan jarak edit <= 2
 */
export function normalizeCityTypo(rawLocation: string): string {
  if (!rawLocation) return rawLocation;

  const cleaned = rawLocation
    .toLowerCase()
    .replace(/[,\.;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Cek langsung seluruh frasa ke kamus alias
  if (CITY_ALIAS_MAP[cleaned]) {
    return CITY_ALIAS_MAP[cleaned];
  }

  // 2. Normalisasikan kata per kata (misal "dr pwt" => "Purwokerto", "ke sby" => "Surabaya")
  const tokens = cleaned.split(" ").filter(Boolean);
  const normalizedTokens = tokens.map((token) => {
    if (CITY_ALIAS_MAP[token]) {
      return CITY_ALIAS_MAP[token];
    }
    return token;
  });

  const joined = normalizedTokens.join(" ");
  if (joined !== cleaned) {
    return joined;
  }

  // 3. Fuzzy match: jika kata tunggal >= 5 huruf dan tidak ada match di kamus
  if (tokens.length === 1 && tokens[0].length >= 5) {
    const single = tokens[0];
    let bestMatch: string | null = null;
    let minDistance = 3; // Hanya toleransi jarak edit maksimal 2 huruf

    for (const city of MAJOR_CITIES) {
      const cityLower = city.toLowerCase();
      // Hanya bandingkan dengan kota yang panjang karakternya berdekatan
      if (Math.abs(cityLower.length - single.length) <= 2) {
        const dist = levenshteinDistance(single, cityLower);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = city;
        }
      }
    }

    if (bestMatch && minDistance <= 2) {
      return bestMatch;
    }
  }

  return rawLocation.trim();
}
