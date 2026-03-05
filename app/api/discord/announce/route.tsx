import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Missing DISCORD_WEBHOOK_URL in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const content = body?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing content string" },
        { status: 400 }
      );
    }

    // Discord limita content a 2000 caratteri
    const safeContent =
      content.length > 1900 ? content.slice(0, 1900) + "\n…(tagliato)" : content;

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: safeContent }),
    });

    const text = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        {
          error: "Discord webhook failed",
          status: r.status,
          details: text || "(empty)",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}