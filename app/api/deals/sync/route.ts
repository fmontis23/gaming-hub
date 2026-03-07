import { NextResponse } from "next/server";

function getBestImage(images: any[] = []) {
  const preferred =
    images.find((img) => img.type === "OfferImageWide") ||
    images.find((img) => img.type === "DieselStoreFrontWide") ||
    images.find((img) => img.type === "Thumbnail") ||
    images[0];

  return preferred?.url ?? null;
}

function getGameUrl(game: any) {
  if (game?.productSlug) {
    return `https://store.epicgames.com/en-US/p/${game.productSlug}`;
  }

  const mapping = game?.catalogNs?.mappings?.[0]?.pageSlug;
  if (mapping) {
    return `https://store.epicgames.com/en-US/p/${mapping}`;
  }

  return "https://store.epicgames.com/en-US/free-games";
}

export async function GET() {
  try {
    const epicRes = await fetch(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=IT&allowCountries=IT",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!epicRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Epic API failed",
      });
    }

    const epicData = await epicRes.json();
    const elements = epicData?.data?.Catalog?.searchStore?.elements ?? [];

    const deals = elements
      .filter((game: any) => {
        const promo = game?.promotions?.promotionalOffers ?? [];
        return promo.length > 0;
      })
      .map((game: any) => {
        const offer = game.promotions.promotionalOffers?.[0]?.promotionalOffers?.[0];

        const originalPrice =
          Number(game?.price?.totalPrice?.originalPrice ?? 0) / 100;

        return {
          title: game.title,
          store: "Epic",
          deal_type: "free",
          price_old: originalPrice,
          price_new: 0,
          currency: game?.price?.totalPrice?.currencyCode ?? "EUR",
          url: getGameUrl(game),
          image_url: getBestImage(game?.keyImages ?? []),
          starts_at: offer?.startDate ?? null,
          ends_at: offer?.endDate ?? null,
        };
      });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase env variables",
      });
    }

    await fetch(`${supabaseUrl}/rest/v1/deals?store=eq.Epic`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/deals`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deals),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return NextResponse.json({
        success: false,
        error: err,
      });
    }

    return NextResponse.json({
      success: true,
      imported: deals.length,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}