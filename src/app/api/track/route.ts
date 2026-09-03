import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courier = searchParams.get("courier")?.trim().toLowerCase();
  const awb = searchParams.get("awb")?.trim();

  if (!courier || !awb) {
    return NextResponse.json(
      { error: "Parameter courier dan awb wajib diisi" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.BINDERBYTE_API_KEY ||
    "c3ce564998ee62ea46fb1f00889cbf4ca8c7752e50c406ee3778508a5ba037bf";

  try {
    const url = `https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${encodeURIComponent(courier)}&awb=${encodeURIComponent(awb)}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    if (data.status !== 200) {
      return NextResponse.json(
        { error: data.message || "Nomor resi tidak ditemukan atau belum terupdate oleh kurir" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Track API Error]", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke gateway kurir. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
