import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const content = body?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing content" },
        { status: 400 }
      );
    }

    // Aggiungi @everyone o @here per avvisare tutti
    const message = `@everyone @here ${content}`;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Discord request failed",
          status: response.status,
          details: errorText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Server error",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}