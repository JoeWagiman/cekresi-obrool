import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Kota/kecamatan asal dan tujuan wajib diisi" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.BINDERBYTE_API_KEY ||
      "sk_sq00lz6ufwyrbnb16jt0mfuhlekkwauv5cogfgsh4wxwrn4np8xqbmoxzhtravw6";

    const couriersToQuery = courier ? [courier] : ["jne", "jnt", "sicepat", "pos", "tiki", "wahana"];
    const results: Array<{ courier: string; service: string; description: string; cost: number; etd: string }> = [];

    // Query Binderbyte cost API
    for (const c of couriersToQuery) {
      try {
        const url = `https://api.binderbyte.com/v1/cost?api_key=${apiKey}&courier=${c}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&weight=${weight || 1}`;
        const res = await fetch(url, { next: { revalidate: 300 } });
        const data = await res.json();

        if (data.status === 200 && Array.isArray(data.data?.costs)) {
          for (const item of data.data.costs) {
            results.push({
              courier: data.data.courier || c.toUpperCase(),
              service: item.service,
              description: item.description,
              cost: item.cost,
              etd: item.etd,
            });
          }
        }
      } catch (err) {
        console.warn(`[Cost Fetch ${c} failed]`, err);
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: "Tarif belum ditemukan untuk rute ini. Pastikan nama kota/kecamatan ditulis lengkap atau tanyakan langsung ke Asisten AI.",
        },
        { status: 404 }
      );
    }

    // Sort by cheapest cost
    results.sort((a, b) => a.cost - b.cost);

    return NextResponse.json({
      status: 200,
      data: {
        origin,
        destination,
        weight: weight || 1,
        costs: results,
      },
    });
  } catch (error) {
    console.error("[Cost API Error]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memeriksa ongkos kirim" },
      { status: 500 }
    );
  }
}
