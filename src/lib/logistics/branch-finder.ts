/**
 * Obrool Courier Branch & Drop Point Location Finder
 * Menghasilkan link pencarian lokasi cabang terdekat di Google Maps
 * serta tautan portal resmi store locator ekspedisi terkait.
 */

export interface BranchFinderResult {
  courier: string;
  courierName: string;
  location: string;
  mapsUrl: string;
  officialLocatorUrl?: string;
}

const OFFICIAL_LOCATORS: Record<string, string> = {
  jne: "https://www.jne.co.id/id/hubungi-kami/lokasi-kami",
  jnt: "https://www.jet.co.id/findlocations",
  sicepat: "https://www.sicepat.com/location",
  pos: "https://www.posindonesia.co.id/id/page/lokasi",
  wahana: "https://www.wahana.com/lokasi-agen",
  ninja: "https://www.ninjaxpress.co/id-id/contact-us",
  lion: "https://lionparcel.com/drop-off",
  tiki: "https://tiki.id/id/location",
  anteraja: "https://anteraja.id/drop-off",
};

export function findCourierBranch(rawCourier?: string, rawLocation?: string): BranchFinderResult {
  const courier = (rawCourier || "all").toLowerCase();
  const location = (rawLocation || "lokasi Anda").trim();

  let courierQuery = "Kantor Ekspedisi & Drop Point";
  let courierName = "Semua Ekspedisi";

  if (courier.includes("jne")) {
    courierQuery = "Kantor JNE Express";
    courierName = "JNE Express";
  } else if (courier.includes("jnt") || courier.includes("j&t") || courier.includes("jt")) {
    courierQuery = "Drop Point J&T Express";
    courierName = "J&T Express";
  } else if (courier.includes("sicepat") || courier.includes("cepat")) {
    courierQuery = "Gerai SiCepat Ekspres";
    courierName = "SiCepat Ekspres";
  } else if (courier.includes("pos")) {
    courierQuery = "Kantor Pos Indonesia";
    courierName = "POS Indonesia";
  } else if (courier.includes("wahana")) {
    courierQuery = "Agen Wahana Express";
    courierName = "Wahana Express";
  } else if (courier.includes("ninja")) {
    courierQuery = "Ninja Point Ninja Xpress";
    courierName = "Ninja Xpress";
  } else if (courier.includes("tiki")) {
    courierQuery = "Kantor TIKI";
    courierName = "TIKI";
  } else if (courier.includes("lion")) {
    courierQuery = "Point POS Lion Parcel";
    courierName = "Lion Parcel";
  } else if (courier.includes("anteraja") || courier.includes("anter")) {
    courierQuery = "Drop Point Anteraja";
    courierName = "Anteraja";
  }

  const queryParam = encodeURIComponent(`${courierQuery} terdekat di ${location}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryParam}`;
  const officialLocatorUrl = OFFICIAL_LOCATORS[courier] || undefined;

  return {
    courier,
    courierName,
    location,
    mapsUrl,
    officialLocatorUrl,
  };
}
