import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { content } = await req.json();

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook URL not set" }, { status: 500 });
  }

  const payload = {
    content: content,
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
    return NextResponse.json({
      error: `Discord error: ${response.status}`,
      details: errorText,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
