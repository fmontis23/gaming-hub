import { NextResponse } from "next/server";

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

    const elements =
      epicData?.data?.Catalog?.searchStore?.elements ?? [];

    const deals = elements
      .filter((game: any) => {
        const promo = game?.promotions?.promotionalOffers ?? [];
        return promo.length > 0;
      })
      .map((game: any) => {
        const offer =
          game.promotions.promotionalOffers[0].promotionalOffers[0];

        return {
          title: game.title,
          store: "Epic",
          deal_type: "free",
          price_old: game.price.totalPrice.originalPrice / 100,
          price_new: 0,
          currency: game.price.totalPrice.currencyCode,
          url: `https://store.epicgames.com/en-US/p/${game.productSlug}`,
          image_url: game.keyImages?.[0]?.url ?? null,
          starts_at: offer.startDate,
          ends_at: offer.endDate,
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

    // cancella vecchi epic deals
    await fetch(
      `${supabaseUrl}/rest/v1/deals?store=eq.Epic`,
      {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    // inserisce nuovi deals
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