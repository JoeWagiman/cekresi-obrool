/**
 * Obrool Logistics Service (Binderbyte API Integration)
 * Menangani pelacakan nomor resi dan perhitungan tarif ongkir ekspedisi Indonesia
 * dengan sistem caching in-memory untuk efisiensi kuota dan kecepatan respons.
 */

import { lookupIndonesianRegion } from './region-lookup';
import { normalizeCityTypo } from './typo-mitigation';
import { smartResolveLocation } from './smart-geocoding';

export interface TrackingHistoryItem {
  date: string;
  desc: string;
  location?: string;
}

export interface TrackingResult {
  courier: string;
  courierName: string;
  waybillNumber: string;
  status: "DELIVERED" | "ON_PROCESS" | "PENDING" | "NOT_FOUND";
  statusDescription: string;
  shipper?: string;
  receiver?: string;
  origin?: string;
  destination?: string;
  lastUpdate?: string;
  history: TrackingHistoryItem[];
  fromCache?: boolean;
}

export interface ShippingCostOption {
  service: string;
  description: string;
  cost: number;
  etd: string | null; // contoh: "1-2 hari" atau null jika kurir tidak menyertakan
}

export interface ShippingCostResult {
  courier: string;
  courierName: string;
  origin: string;
  destination: string;
  weightGrams: number;
  services: ShippingCostOption[];
  fromCache?: boolean;
}

// In-Memory Cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const trackingCache = new Map<string, CacheEntry<TrackingResult>>();
const costCache = new Map<string, CacheEntry<ShippingCostResult>>();

const TRACKING_CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit
const COST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

/**
 * Normalisasi nama kurir dari bahasa percakapan sehari-hari pembeli
 */
export function normalizeCourier(input?: string): { code: string; name: string } {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { code: "all", name: "Semua Kurir" };
  }
  const clean = input.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (clean.includes("cargo") && (clean.includes("jnt") || clean.includes("jt"))) {
    return { code: "jnt_cargo", name: "J&T Cargo" };
  }
  if (clean.includes("jnt") || clean.includes("jandt") || clean.includes("jt")) {
    return { code: "jnt", name: "J&T Express" };
  }
  if (clean.includes("sicepat") || clean.includes("cepat")) {
    return { code: "sicepat", name: "SiCepat Ekspres" };
  }
  if (clean.includes("anteraja") || clean.includes("anter")) {
    return { code: "anteraja", name: "Anteraja" };
  }
  if (clean.includes("pos") || clean.includes("posindo")) {
    return { code: "pos", name: "Pos Indonesia" };
  }
  if (clean.includes("ninja") || clean.includes("ninjaxpress")) {
    return { code: "ninja", name: "Ninja Xpress" };
  }
  if (clean.includes("spx") || clean.includes("shopee")) {
    return { code: "spx", name: "Shopee Xpress (SPX)" };
  }
  if (clean.includes("lion") || clean.includes("lionparcel")) {
    return { code: "lion", name: "Lion Parcel" };
  }
  if (clean.includes("tiki")) {
    return { code: "tiki", name: "TIKI" };
  }
  if (clean.includes("wahana")) {
    return { code: "wahana", name: "Wahana Express" };
  }
  if (clean.includes("ide") || clean.includes("idexpress")) {
    return { code: "ide", name: "ID Express" };
  }
  if (clean.includes("indah") || clean.includes("indahcargo")) {
    return { code: "indah_cargo", name: "Indah Cargo" };
  }
  if (clean.includes("dakota")) {
    return { code: "dakota", name: "Dakota Cargo" };
  }
  if (clean.includes("sap")) {
    return { code: "sap", name: "SAP Express" };
  }
  if (clean.includes("lex") || clean.includes("lazada")) {
    return { code: "lex", name: "Lazada Express" };
  }
  if (clean.includes("tokopedia") || clean.includes("tkp")) {
    return { code: "kurir_tokopedia", name: "Kurir Rekomendasi Tokopedia" };
  }

  // Default fallback
  return { code: "jne", name: "JNE Express" };
}

function getApiKey(): string | undefined {
  return (
    process.env.BINDERBYTE_API_KEY ||
    process.env.BINDERHUB_API_KEY ||
    process.env.BINDER_API_KEY ||
    "sk_sq00lz6ufwyrbnb16jt0mfuhlekkwauv5cogfgsh4wxwrn4np8xqbmoxzhtravw6"
  );
}

function getBaseUrl(): string {
  return (
    process.env.BINDERBYTE_BASE_URL ||
    process.env.BINDERHUB_BASE_URL ||
    "https://api.binderbyte.com/v1"
  ).replace(/\/$/, "");
}

/**
 * Lacak Nomor Resi Ekspedisi
 */
export async function trackWaybill(
  rawCourier: string,
  rawAwb: string
): Promise<TrackingResult> {
  const courier = normalizeCourier(rawCourier);
  const awb = rawAwb.trim().toUpperCase();
  const cacheKey = `${courier.code}:${awb}`;

  // 1. Cek In-Memory Cache
  const cached = trackingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, fromCache: true };
  }

  const apiKey = getApiKey();

  // 2. Jika API Key belum dikonfigurasi, gunakan data respons realistis (Mock)
  if (!apiKey) {
    const mockResult: TrackingResult = {
      courier: courier.code,
      courierName: courier.name,
      waybillNumber: awb,
      status: "ON_PROCESS",
      statusDescription: "Paket sedang dalam perjalanan transit menuju kota tujuan.",
      shipper: "Toko Online Mitra Obrool",
      receiver: "Pelanggan Terhormat",
      origin: "JAKARTA",
      destination: "KOTA TUJUAN",
      lastUpdate: new Date().toLocaleString("id-ID"),
      history: [
        {
          date: new Date(Date.now() - 3600000 * 4).toLocaleString("id-ID"),
          desc: "Paket telah diterima di drop point cabang asal.",
          location: "Sorting Hub Jakarta",
        },
        {
          date: new Date(Date.now() - 3600000 * 2).toLocaleString("id-ID"),
          desc: "Paket diteruskan ke pusat transit tujuan.",
          location: "Gateway Transit",
        },
      ],
      fromCache: false,
    };

    trackingCache.set(cacheKey, {
      data: mockResult,
      expiresAt: Date.now() + TRACKING_CACHE_TTL_MS,
    });
    return mockResult;
  }

  // 3. Panggil API Binderbyte
  try {
    const url = `${getBaseUrl()}/track?api_key=${apiKey}&courier=${courier.code}&awb=${awb}`;
    const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
    const json = await res.json().catch(() => null);

    console.log("[Binderbyte Track Response]", {
      status: res.status,
      message: json?.message,
      courier: courier.code,
      awb,
    });

    if (res.status === 400 || !res.ok || !json?.data) {
      const msg = json?.message || "Nomor resi tidak ditemukan di sistem ekspedisi.";
      const notFoundResult: TrackingResult = {
        courier: courier.code,
        courierName: courier.name,
        waybillNumber: awb,
        status: "NOT_FOUND",
        statusDescription: `${msg} Pandu pembeli: minta cek kembali apakah ada salah ketik huruf/angka, atau jelaskan bahwa paket yang baru diserahkan ke kurir biasanya memerlukan waktu 1x24 jam untuk terdata di sistem pusat ekspedisi.`,
        history: [],
        fromCache: false,
      };
      return notFoundResult;
    }

    const d = json.data;
    const historyList: TrackingHistoryItem[] = Array.isArray(d.history)
      ? d.history.map((h: any) => ({
          date: h.date || "",
          desc: h.desc || "",
          location: h.location || "",
        }))
      : [];

    const serviceInfo = d.summary?.service ? `[${d.summary.service}] ` : "";
    const result: TrackingResult = {
      courier: courier.code,
      courierName: d.summary?.courier || courier.name,
      waybillNumber: d.summary?.awb || d.summary?.waybill_number || awb,
      status: d.summary?.status === "DELIVERED" ? "DELIVERED" : "ON_PROCESS",
      statusDescription: `${serviceInfo}${d.summary?.desc || "Paket sedang dalam proses pengiriman."}`.trim(),
      shipper: d.detail?.shipper || "-",
      receiver: d.detail?.receiver || "-",
      origin: d.detail?.origin || "-",
      destination: d.detail?.destination || "-",
      lastUpdate: d.summary?.date || new Date().toLocaleString("id-ID"),
      history: historyList,
      fromCache: false,
    };

    trackingCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + TRACKING_CACHE_TTL_MS,
    });

    return result;
  } catch (err) {
    console.warn("[Binderbyte Tracking Error]", err);
    throw err;
  }
}

const PROVINCE_WORDS = [
  "bali",
  "jawa barat", "jabar",
  "jawa tengah", "jateng",
  "jawa timur", "jatim",
  "dki jakarta", "jakarta",
  "sumatera utara", "sumut",
  "sumatera barat", "sumbar",
  "sumatera selatan", "sumsel",
  "kalimantan timur", "kaltim",
  "kalimantan barat", "kalbar",
  "kalimantan selatan", "kalsel",
  "kalimantan tengah", "kalteng",
  "sulawesi selatan", "sulsel",
  "sulawesi utara", "sulut",
  "nusa tenggara barat", "ntb",
  "nusa tenggara timur", "ntt",
  "papua", "banten", "lampung", "riau", "kepri", "diy", "yogyakarta"
];

function stripProvinceSuffix(text: string): string {
  let clean = text.trim();
  for (const prov of PROVINCE_WORDS) {
    const reg = new RegExp(`\\b${prov}\\b`, "gi");
    const stripped = clean.replace(reg, "").replace(/,\s*$/, "").trim();
    if (stripped.length >= 3 && stripped !== clean) {
      return stripped;
    }
  }
  return text;
}

function scoreLocationItem(item: { id: string; type: string; label: string }, query: string): number {
  const labelLower = item.label.toLowerCase();
  const qLower = query.toLowerCase().trim();
  let score = 0;

  // 1. Prioritas khusus wilayah ibu kota / provinsi metropolitan
  if (qLower === "jakarta" || qLower === "dki jakarta") {
    if (item.id.startsWith("district_31") || item.id.startsWith("city_31")) {
      score += 150;
    }
  }

  // 2. Prioritaskan tipe tingkat pemerintahan
  // Kecamatan (district) adalah tingkat paling didukung oleh semua kurir ekspedisi di Binderbyte
  if (item.type === "district") {
    score += 80;
  } else if (item.type === "city") {
    score += 40;
  } else if (item.type === "village") {
    score += 5; // Desa diutamakan paling akhir agar tidak mengalahkan kecamatan/kota utama
  }

  // 3. Relevansi teks nama wilayah
  try {
    if (new RegExp(`^${qLower}\\b`, "i").test(labelLower)) {
      score += 60; // Awalan tepat ("Medan ...")
    } else if (new RegExp(`\\b${qLower}\\b`, "i").test(labelLower)) {
      score += 40; // Kata utuh ("... Jakarta Timur", "... Medan")
    } else if (labelLower.includes(qLower)) {
    }
  } catch {
    if (labelLower.includes(qLower)) score += 10;
  }

  // 4. Bonus jika nama query adalah nama Kabupaten/Kota induk (terletak setelah tanda koma, misal: "Banjarsari, Surakarta")
  if (labelLower.includes(`, ${qLower}`) || labelLower.endsWith(`, ${qLower}`)) {
    score += 50;
  }

  return score;
}

/**
 * Resolusikan teks wilayah ke ID lokasi Binderbyte resmi
 * (Format: district_XX.YY.ZZ, village_XX.YY.ZZ.AAAA, atau city_XX.YY)
 */
export async function resolveBinderbyteLocation(
  rawText: string,
  apiKey: string
): Promise<{ id: string; label: string } | null> {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  if (trimmed.startsWith("district_") || trimmed.startsWith("city_")) {
    return { id: trimmed, label: trimmed };
  }

  // 0. Cek Kemendagri grounding terlebih dahulu jika query memiliki lebih dari 1 kata kunci wilayah
  // (misal: "Balamoa Tegal" -> mencocokkan Desa Balamoa di Kab. Tegal daripada menebak Tegal Barat)
  const cleanTokens = trimmed
    .replace(/[,\.;:!?]/g, " ")
    .replace(/\b(dari|ke|di|ongkir|tarif|paket|berat|kg|kilo|gram)\b/gi, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  if (cleanTokens.length > 1) {
    const localMatches = await lookupIndonesianRegion(trimmed);
    if (localMatches.length > 0 && (localMatches[0].score || 0) >= 3) {
      const best = localMatches[0];
      if (best.districtCode) {
        return {
          id: `district_${best.districtCode}`,
          label: `${best.villageName ? best.villageName + ", " : ""}${best.districtName}, ${best.regencyName}`,
        };
      }
    }
  }

  // 1. Prioritaskan mesin geocoding cerdas Kemendagri lokal (0ms) yang 100% akurat tingkat kecamatan
  const smart = await smartResolveLocation(rawText);
  if (smart) {
    return smart;
  }

  const clean = rawText
    .replace(/[,\.;:!?]/g, " ")
    .replace(/\b(dari|ke|di|ongkir|tarif|paket|berat|kg|kilo|gram)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const normalized = normalizeCityTypo(clean);
  const stripped = stripProvinceSuffix(clean);
  const strippedNormalized = stripProvinceSuffix(normalized);
  const candidates = Array.from(new Set([clean, normalized, stripped, strippedNormalized])).filter(Boolean);

  // 1. Coba cari ke endpoint Binderbyte /v1/locations untuk setiap candidate
  for (const query of candidates) {
    try {
      const url = `${getBaseUrl()}/locations?search=${encodeURIComponent(query)}&api_key=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => null);

      if (json?.code === "200" && Array.isArray(json.data) && json.data.length > 0) {
        // Urutkan berdasarkan relevansi query dan prioritaskan district
        const sorted = [...json.data].sort((a, b) => scoreLocationItem(b, query) - scoreLocationItem(a, query));
        const best = sorted[0];
        return {
          id: best.id,
          label: best.label,
        };
      }
    } catch (err) {
      console.warn("[Binderbyte Location Lookup Warning]", err);
    }
  }

  // 2. Fallback via database lokal Kemendagri
  for (const query of candidates) {
    const localMatches = await lookupIndonesianRegion(query);
    if (localMatches.length > 0) {
      const bestMatch = localMatches.find((m) => m.level === "regency" || m.level === "district") || localMatches[0];
      // Ekspedisi Indonesia (Binderbyte/RajaOngkir) menghitung tarif berbasis kecamatan (district) atau kabupaten/kota (city).
      // Jika input pengguna adalah level desa/kelurahan (seperti 'Balamoa'), gunakan kode kecamatannya (districtCode).
      if (bestMatch.districtCode) {
        return {
          id: `district_${bestMatch.districtCode}`,
          label: bestMatch.formatted,
        };
      }
      if (bestMatch.regencyCode) {
        return {
          id: `city_${bestMatch.regencyCode}`,
          label: bestMatch.formatted,
        };
      }
    }
  }

  return null;
}

/**
 * Cek Tarif Ongkos Kirim Resmi Binderbyte (POST /v1/cost)
 */
export async function checkShippingCost(
  rawCourier?: string,
  origin: string = "",
  destination: string = "",
  weightGrams: number = 1000
): Promise<ShippingCostResult> {
  const courier = normalizeCourier(rawCourier);
  const cacheKey = `${courier.code}:${origin.trim().toLowerCase()}:${destination.trim().toLowerCase()}:${weightGrams}`;

  // 1. Cek In-Memory Cache
  const cached = costCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, fromCache: true };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key ekspedisi belum dikonfigurasi.");
  }

  const weightKg = Math.max(1, Math.round(weightGrams / 1000));

  // 2. Resolusikan Origin & Destination ke Location ID Binderbyte
  const [originLoc, destLoc] = await Promise.all([
    resolveBinderbyteLocation(origin, apiKey),
    resolveBinderbyteLocation(destination, apiKey),
  ]);

  if (!originLoc || !destLoc) {
    throw new Error("Lokasi asal atau tujuan pengiriman tidak ditemukan di sistem ekspedisi.");
  }

  // 3. Panggil API Binderbyte POST /v1/cost
  const couriersToTry = courier.code && courier.code !== "all"
    ? [courier.code, "jnt", "ninja", "wahana", "tiki", "jne", "pos"]
    : ["jnt", "ninja", "wahana", "tiki", "jne", "pos", "lion"];
  const uniqueCouriers = Array.from(new Set(couriersToTry)).filter(Boolean);

  const allServices: ShippingCostOption[] = [];

  await Promise.all(
    uniqueCouriers.map(async (c) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const params = new URLSearchParams();
        params.append("api_key", apiKey);
        params.append("courier", c);
        params.append("origin", originLoc.id);
        params.append("destination", destLoc.id);
        params.append("weight", String(weightKg));

        const res = await fetch(`${getBaseUrl()}/cost`, {
          method: "POST",
          body: params,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const json = await res.json().catch(() => null);

        if (json?.code === "200" && Array.isArray(json.data?.results)) {
          for (const cr of json.data.results) {
            for (const cost of cr.costs || []) {
              const validEstimated = cost.estimated && cost.estimated.trim() !== "" && cost.estimated !== "- hari" && cost.estimated !== "-"
                ? cost.estimated.trim()
                : null;

              allServices.push({
                service: `${cr.name} - ${cost.service || cost.type || "Reguler"}`,
                description: cost.type || cost.service || "Layanan Pengiriman",
                cost: Number(cost.price) || 0,
                etd: validEstimated,
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[Binderbyte Cost Error for ${c}]`, err);
      } finally {
        clearTimeout(timeoutId);
      }
    })
  );

  if (allServices.length === 0) {
    throw new Error("Tidak ada layanan kurir yang tersedia untuk rute tersebut saat ini.");
  }

  // Urutkan opsi ongkir dari yang paling hemat
  allServices.sort((a, b) => a.cost - b.cost);

  const result: ShippingCostResult = {
    courier: courier.code,
    courierName: courier.name,
    origin: originLoc.label,
    destination: destLoc.label,
    weightGrams,
    services: allServices,
    fromCache: false,
  };

  costCache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + COST_CACHE_TTL_MS,
  });

  return result;
}
