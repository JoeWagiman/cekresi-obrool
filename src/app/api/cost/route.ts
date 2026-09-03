import { NextResponse } from "next/server";
import { checkShippingCost } from "@/lib/logistics/binderbyte";

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin")?.trim();
    const destination = searchParams.get("destination")?.trim();
    const weightParam = searchParams.get("weight")?.trim() || "1000";
    const courier = searchParams.get("courier")?.trim().toLowerCase() || "all";

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Kota/kecamatan asal dan tujuan wajib diisi" },
        { status: 400 }
      );
    }

    const weightGrams = Math.max(100, parseInt(weightParam, 10) || 1000);
    const result = await checkShippingCost(courier, origin, destination, weightGrams);

    return NextResponse.json({
      status: 200,
      origin: result.origin,
      destination: result.destination,
      weight: result.weightGrams / 1000,
      rates: result.services,
    });
  } catch (error) {
    console.error("[Cost API GET Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memeriksa ongkos kirim" },
      { status: 500 }
    );
  }
}

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

    const weightGrams = Math.max(100, parseInt(String(weight), 10) || 1000);
    const result = await checkShippingCost(courier || "all", origin, destination, weightGrams);

    return NextResponse.json({
      status: 200,
      origin: result.origin,
      destination: result.destination,
      weight: result.weightGrams / 1000,
      rates: result.services,
    });
  } catch (error) {
    console.error("[Cost API POST Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memeriksa ongkos kirim" },
      { status: 500 }
    );
  }
}
