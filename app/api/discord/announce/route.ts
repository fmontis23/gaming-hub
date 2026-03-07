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

    const title = body?.title ?? "🎮 Gaming Hub";
    const description = body?.description ?? "";
    const url = body?.url ?? "";
    const mention = body?.mention ?? "@everyone";

    const allowedMentions =
      mention === "@everyone"
        ? { parse: ["everyone"] }
        : mention === "@here"
        ? { parse: ["everyone"] }
        : { parse: [] };

    const payload = {
      content: mention || "",
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title,
          description,
          url,
          color: 8388736,
          footer: {
            text: "Gaming Hub Community",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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