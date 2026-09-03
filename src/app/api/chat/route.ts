import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, recentHistory } = body;

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const obroolApiUrl = process.env.NEXT_PUBLIC_OBROOL_API_URL || "https://obrool.com";
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "cmtloaz4p0001ob70a96jvol3";

    const res = await fetch(`${obroolApiUrl}/api/adp/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        message,
        sessionId: sessionId || "guest_cekresi_" + Date.now(),
        guestDeviceId: sessionId || "guest_cekresi_" + Date.now(),
        ...(Array.isArray(recentHistory) ? { recentHistory } : {}),
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[CekResi Chat Proxy Error]", error);
    return NextResponse.json(
      {
        reply: "Maaf, sedang terjadi gangguan saat menghubungi asisten AI logistik. Silakan coba kembali dalam beberapa saat.",
      },
      { status: 500 }
    );
  }
}
