/**
 * Obrool Indonesian Administrative Region Grounding Service
 * Menyediakan verifikasi faktual nama Desa/Kelurahan, Kecamatan, Kabupaten/Kota, dan Provinsi
 * di seluruh Indonesia berdasarkan data resmi Kemendagri (via idn-area-data).
 * Mencegah halusinasi AI pada nama wilayah kembar (seperti Karanglewas Purbalingga vs Karanglewas Banyumas).
 */

import { getDistricts, getRegencies, getProvinces, getVillages } from "idn-area-data";

export interface RegionMatch {
  level: "village" | "district" | "regency";
  villageCode?: string;
  villageName?: string;
  districtCode: string;
  districtName: string;
  regencyCode: string;
  regencyName: string;
  provinceCode: string;
  provinceName: string;
  formatted: string;
  score?: number;
}

interface InternalVillage {
  code: string;
  district_code: string;
  name: string;
}

interface InternalDistrict {
  code: string;
  regency_code: string;
  name: string;
}

interface InternalRegency {
  code: string;
  province_code: string;
  name: string;
}

interface InternalProvince {
  code: string;
  name: string;
}

// In-memory indexed caches
let isInitialized = false;
const villagesByName = new Map<string, InternalVillage[]>();
const districtsByCode = new Map<string, InternalDistrict>();
const regenciesByCode = new Map<string, InternalRegency>();
const provincesByCode = new Map<string, InternalProvince>();

let districtsSortedByLength: InternalDistrict[] = [];
let regenciesSortedByLength: InternalRegency[] = [];

async function ensureDataLoaded() {
  if (isInitialized) return;

  try {
    const [villages, districts, regencies, provinces] = await Promise.all([
      getVillages() as Promise<InternalVillage[]>,
      getDistricts() as Promise<InternalDistrict[]>,
      getRegencies() as Promise<InternalRegency[]>,
      getProvinces() as Promise<InternalProvince[]>,
    ]);

    // Index Provinsi
    for (const p of provinces || []) {
      provincesByCode.set(p.code, p);
    }

    // Index Kabupaten/Kota
    for (const r of regencies || []) {
      regenciesByCode.set(r.code, r);
    }
    regenciesSortedByLength = [...(regencies || [])].sort((a, b) => b.name.length - a.name.length);

    // Index Kecamatan
    for (const d of districts || []) {
      districtsByCode.set(d.code, d);
    }
    districtsSortedByLength = [...(districts || [])].sort((a, b) => b.name.length - a.name.length);

    // Index Desa/Kelurahan (Map lowercase name -> array of villages)
    for (const v of villages || []) {
      const key = v.name.toLowerCase();
      if (!villagesByName.has(key)) {
        villagesByName.set(key, []);
      }
      villagesByName.get(key)!.push(v);
    }

    isInitialized = true;
  } catch (err) {
    console.warn("[Region Lookup] Failed to load idn-area-data:", err);
  }
}

/**
 * Cari nama wilayah Indonesia (Desa, Kecamatan, Kabupaten/Kota) berdasarkan teks percakapan.
 * Menghitung skor relevansi konteks antar kata untuk akurasi optimal.
 */
export async function lookupIndonesianRegion(rawQuery: string): Promise<RegionMatch[]> {
  await ensureDataLoaded();

  if (!rawQuery) return [];

  const textLower = rawQuery.toLowerCase();
  const rawTokens = textLower
    .replace(/\b(dari|ke|di|ongkir|tarif|resi|paket|cek|tolong|kak|min|dong|ya|alamat|pengiriman)\b/gi, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  const matches: RegionMatch[] = [];
  const seenCodes = new Set<string>();

  // 1. Cek Pencocokan Tingkat Desa / Kelurahan
  for (const token of rawTokens) {
    const candidateVillages = villagesByName.get(token);
    if (candidateVillages) {
      for (const v of candidateVillages) {
        const dist = districtsByCode.get(v.district_code);
        const reg = dist ? regenciesByCode.get(dist.regency_code) : undefined;
        const prov = reg ? provincesByCode.get(reg.province_code) : undefined;

        if (dist && reg && prov && !seenCodes.has(v.code)) {
          seenCodes.add(v.code);

          // Hitung skor konteks: jika pesan juga menyebut nama kabupaten atau kecamatannya
          let score = 1;
          const regNameLower = reg.name.toLowerCase();
          const distNameLower = dist.name.toLowerCase();

          for (const otherToken of rawTokens) {
            if (otherToken !== token) {
              if (regNameLower.includes(otherToken)) score += 5;
              if (distNameLower.includes(otherToken)) score += 5;
            }
          }

          matches.push({
            level: "village",
            villageCode: v.code,
            villageName: v.name,
            districtCode: dist.code,
            districtName: dist.name,
            regencyCode: reg.code,
            regencyName: reg.name,
            provinceCode: prov.code,
            provinceName: prov.name,
            formatted: `Desa ${v.name}, Kecamatan ${dist.name}, ${reg.name}, Provinsi ${prov.name}`,
            score,
          });
        }
      }
    }
  }

  // 2. Cek Pencocokan Tingkat Kecamatan
  for (const d of districtsSortedByLength) {
    const dName = d.name.toLowerCase();
    if (dName.length < 4) continue;

    const pattern = new RegExp(`\\b${dName.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\b`, "i");
    if (pattern.test(textLower)) {
      const reg = regenciesByCode.get(d.regency_code);
      const prov = reg ? provincesByCode.get(reg.province_code) : undefined;

      if (reg && prov && !seenCodes.has(d.code)) {
        seenCodes.add(d.code);

        let score = 2;
        const regNameLower = reg.name.toLowerCase();
        for (const token of rawTokens) {
          if (regNameLower.includes(token)) score += 4;
        }

        matches.push({
          level: "district",
          districtCode: d.code,
          districtName: d.name,
          regencyCode: reg.code,
          regencyName: reg.name,
          provinceCode: prov.code,
          provinceName: prov.name,
          formatted: `Kecamatan ${d.name}, ${reg.name}, Provinsi ${prov.name}`,
          score,
        });
      }
    }

    if (matches.length >= 10) break;
  }

  // 3. Cek Pencocokan Tingkat Kabupaten/Kota (jika belum ada match)
  if (matches.length === 0) {
    for (const r of regenciesSortedByLength) {
      const simpleName = r.name
        .toLowerCase()
        .replace(/^(kabupaten|kota)\s+/i, "")
        .trim();

      if (simpleName.length < 4) continue;

      const pattern = new RegExp(`\\b${simpleName.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\$&")}\\b`, "i");
      if (pattern.test(textLower)) {
        const prov = provincesByCode.get(r.province_code);
        if (prov && !seenCodes.has(r.code)) {
          seenCodes.add(r.code);
          matches.push({
            level: "regency",
            districtCode: "",
            districtName: "",
            regencyCode: r.code,
            regencyName: r.name,
            provinceCode: prov.code,
            provinceName: prov.name,
            formatted: `${r.name}, Provinsi ${prov.name}`,
            score: 1,
          });
        }
      }
    }
  }

  // Urutkan berdasarkan skor relevansi tertinggi (prioritas kesesuaian konteks kabupaten/kecamatan)
  return matches.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
}
