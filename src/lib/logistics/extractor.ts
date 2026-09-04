/**
 * Obrool Logistics Intent Extractor
 * Mengekstrak nomor resi, kurir, rute kota asal-tujuan, dan berat paket
 * dari percakapan natural pembeli dalam bahasa Indonesia.
 */

import { normalizeCityTypo } from "./typo-mitigation";

export interface LogisticsIntent {
  type: "tracking" | "cost" | "branch";
  courier: string;
  awb?: string;
  origin?: string;
  destination?: string;
  weightGrams?: number;
  location?: string;
}

const COURIER_KEYWORDS = [
  "jnt",
  "j&t",
  "jt",
  "sicepat",
  "cepat",
  "anteraja",
  "anter",
  "jne",
  "pos",
  "ninja",
  "spx",
  "shopee",
  "lion",
  "tiki",
  "wahana",
  "idexpress",
  "ide",
];

export function extractLogisticsIntent(message: string, previousAgentMessage?: string): LogisticsIntent | null {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 1. Deteksi Kurir dari Teks (menggunakan batas kata agar kata seperti 'poso' tidak keliru jadi 'pos')
  let detectedCourier = "all";
  for (const c of COURIER_KEYWORDS) {
    const reg = new RegExp(`(^|[^a-z0-9])${c}([^a-z0-9]|$)`, "i");
    if (reg.test(lower)) {
      detectedCourier = c;
      break;
    }
  }

  // 1b. Deteksi Jawaban Afirmatif ("ya", "iya", "mau", "boleh") atas tawaran pencarian cabang terdekat dari agen
  if (previousAgentMessage) {
    const isAffirmative = /^(ya|iya|mau|boleh|tolong|ok|oke|yoi|bantu|yes|yup|dong|tentu|silakan|bisa)\b/i.test(lower);
    if (isAffirmative) {
      const match = previousAgentMessage.match(/terdekat di sekitar\s+([^?]+)/i);
      if (match) {
        return {
          type: "branch",
          courier: detectedCourier,
          location: match[1].trim(),
        };
      }
    }
  }

  // 2. Deteksi Pelacakan Resi (Tracking)
  const isTrackingQuery =
    lower.includes("resi") ||
    lower.includes("lacak") ||
    lower.includes("tracking") ||
    lower.includes("awb") ||
    lower.includes("posisi paket") ||
    lower.includes("sampai mana") ||
    lower.includes("status paket");

  // Format umum resi ekspedisi Indonesia: Alfanumerik 8–24 karakter dan WAJIB mengandung minimal 4 digit angka.
  // Contoh: JP1234567890, SPXID0123456789, 012345678901, 582230008329223.
  // Kata bahasa umum (seperti "INDONESIA", "NUSANTARA", "PENGIRIMAN") TIDAK BOLEH dianggap nomor resi.
  const awbRegex = /\b([A-Z0-9]{8,24})\b/i;
  const matches = text.match(awbRegex);

  if (isTrackingQuery && matches) {
    const candidate = matches[1].toUpperCase();
    const digitCount = (candidate.match(/\d/g) || []).length;
    const blacklistWords = ["TRACKING", "PENGIRIMAN", "EXPEDISI", "EKSPEDISI", "KIRIMAN", "SICEPAT", "ANTERAJA", "INDONESIA", "NUSANTARA"];

    // Wajib mengandung minimal 4 digit angka agar kata bahasa umum tidak salah dianggap nomor resi
    if (digitCount >= 4 && !blacklistWords.includes(candidate)) {
      return {
        type: "tracking",
        courier: detectedCourier !== "all" ? detectedCourier : "jne",
        awb: candidate,
      };
    }
  }

  // 2b. Deteksi Permintaan Lokasi Kantor / Drop Point Ekspedisi Terdekat (Branch)
  const isBranchQuery =
    lower.includes("terdekat") ||
    lower.includes("drop point") ||
    lower.includes("droppoint") ||
    lower.includes("kantor cabang") ||
    lower.includes("kantor kurir") ||
    lower.includes("agen terdekat") ||
    lower.includes("lokasi ekspedisi") ||
    lower.includes("alamat cabang") ||
    lower.includes("alamat kantor") ||
    lower.includes("titik kirim") ||
    lower.includes("tempat kirim");

  if (isBranchQuery) {
    const diMatch = text.match(/(?:di|sekitar|daerah|wilayah|area)\s+([^,?.!]+)/i);
    let branchLoc = diMatch ? diMatch[1].trim() : "";
    if (branchLoc) {
      branchLoc = normalizeCityTypo(branchLoc);
    }

    return {
      type: "branch",
      courier: detectedCourier,
      location: branchLoc || undefined,
    };
  }

  // 3. Deteksi Pengecekan Tarif Ongkir (Cost)
  const isCostQuery =
    lower.includes("ongkir") ||
    lower.includes("onkir") ||
    lower.includes("ongkr") ||
    lower.includes("ogkir") ||
    lower.includes("ongkos") ||
    lower.includes("tarif") ||
    lower.includes("traif") ||
    lower.includes("biaya") ||
    lower.includes("kirim") ||
    lower.includes("pengiriman") ||
    lower.includes("paket") ||
    (lower.includes(" ke ") && (lower.includes("berat") || lower.includes("kg") || lower.includes("kilo") || lower.includes("gram"))) ||
    ((lower.includes("dari ") || lower.includes("dr ") || lower.includes("dri ")) && (lower.includes(" ke ") || lower.includes(" k ")));

  if (isCostQuery) {
    // Ekstrak rute
    let origin = "Jakarta";
    let destination = "";

    const cleanWordRegex = /\b(berapa|berat|seberat|kira-kira|estimasi|dengan|kak|min|gan|ya|tolong|dong|cek|ongkir|onkir|ongkr|ogkir|ongkos|tarif|traif|biaya|kirim|paket|dari|dr|dri|asal|tujuan)\b|[?,.;:!]/gi;

    // Pola 1: "[dari] [kota] ke [kota]" (kata "dari" bersifat opsional jika ada kata "ke")
    const dariKeMatch = text.match(/(?:(?:\bdari\b|\bdr\b|\bdri\b)\s+)?([a-zA-Z\s]+?)\s+(?:\bke\b|\bk\b)\s+([a-zA-Z\s]+?)(?:,\s*berat|\s+\d+\s*(?:kg|kilo|gram|gr)|\s+berat|\s*$)/i);

    // Pola 2: Format koma atau strip tanpa kata dari/ke, misal: "cek ongkir sokaraja, surakarta 3 kg" atau "ongkir bandung - surabaya 2kg"
    const commaSeparatedMatch = !dariKeMatch
      ? text.match(/(?:.*?(?:ongkir|tarif|biaya|kirim)\s+)?([a-zA-Z\s]+?)\s*[,-\/]\s*([a-zA-Z\s]+?)(?:,\s*berat|\s+\d+\s*(?:kg|kilo|gram|gr)|\s+berat|\s*$)/i)
      : null;

    if (dariKeMatch) {
      origin = dariKeMatch[1].replace(cleanWordRegex, " ").replace(/^[,\s.-]+|[,\s.-]+$/g, "").trim();
      destination = dariKeMatch[2].replace(cleanWordRegex, " ").replace(/^[,\s.-]+|[,\s.-]+$/g, "").trim();
    } else if (commaSeparatedMatch && commaSeparatedMatch[1].trim() && commaSeparatedMatch[2].trim()) {
      const rawOrigin = commaSeparatedMatch[1].replace(cleanWordRegex, " ").replace(/^[,\s.-]+|[,\s.-]+$/g, "").trim();
      const rawDest = commaSeparatedMatch[2].replace(cleanWordRegex, " ").replace(/^[,\s.-]+|[,\s.-]+$/g, "").trim();
      if (rawOrigin && rawDest) {
        origin = rawOrigin;
        destination = rawDest;
      }
    } else {
      // Pola 3: Format "ke [kota]" saja (contoh: "ongkir ke Surabaya berapa?")
      // Gunakan batasan kata \b agar huruf k pada kata "cek" tidak disangka sebagai "ke"
      const keMatch = text.match(/(?:\bke\b|\bk\b)\s+(.+?)(?:,\s*berat|\s+\d+\s*(?:kg|kilo|gram|gr)|\s+berat|\s*$)/i);
      if (keMatch) {
        destination = keMatch[1].replace(cleanWordRegex, " ").replace(/^[,\s.-]+|[,\s.-]+$/g, "").trim();
      }
    }

    origin = origin.replace(/^(?:dari|dr|dri|asal)\s+/i, "").trim();
    destination = destination.replace(/^(?:ke|k|tujuan)\s+/i, "").trim();

    // Normalisasi typo dan singkatan kota (pwt => Purwokerto, sby => Surabaya, jogja => Yogyakarta, dll)
    if (origin) origin = normalizeCityTypo(origin);
    if (destination) destination = normalizeCityTypo(destination);

    // Ekstrak perkiraan berat jika ada (contoh: "2 kg", "500 gram", "1.5 kg")
    let weightGrams = 1000;
    const kgMatch = lower.match(/([0-9]+([.,][0-9]+)?)\s*(kg|kilo)/);
    const gramMatch = lower.match(/([0-9]+)\s*(gram|gr)/);

    if (kgMatch) {
      const kgVal = parseFloat(kgMatch[1].replace(",", "."));
      weightGrams = Math.round(kgVal * 1000);
    } else if (gramMatch) {
      weightGrams = parseInt(gramMatch[1], 10);
    }

    if (destination && destination.length >= 3) {
      return {
        type: "cost",
        courier: detectedCourier,
        origin,
        destination,
        weightGrams,
      };
    }
  }

  return null;
}
