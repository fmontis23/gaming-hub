import { NextResponse } from "next/server";

function toAbsoluteUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  if (!siteUrl) return url;

  const normalizedBase = siteUrl.endsWith("/")
    ? siteUrl.slice(0, -1)
    : siteUrl;

  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  return `${normalizedBase}${normalizedPath}`;
}

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
    const rawDescription = body?.description ?? "";
    const rawUrl = body?.url ?? "";
    const mention = body?.mention ?? "@everyone";

    const absoluteUrl = toAbsoluteUrl(rawUrl);

    const allowedMentions =
      mention === "@everyone"
        ? { parse: ["everyone"] }
        : mention === "@here"
        ? { parse: ["everyone"] }
        : { parse: [] };

    const description = absoluteUrl
      ? `${rawDescription}\n\n🔗 **Registrazione:** ${absoluteUrl}`
      : rawDescription;

    const payload = {
      content: mention || "",
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title,
          description,
          url: absoluteUrl || undefined,
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