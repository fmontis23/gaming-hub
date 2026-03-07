import { NextResponse } from "next/server";

type EpicApiResponse = {
  data?: {
    Catalog?: {
      searchStore?: {
        elements?: any[];
      };
    };
  };
};

function pickImage(images: any[] = []) {
  const preferred =
    images.find((img) => img.type === "OfferImageWide") ||
    images.find((img) => img.type === "DieselStoreFrontWide") ||
    images.find((img) => img.type === "Thumbnail") ||
    images[0];

  return preferred?.url ?? null;
}

function pickSlug(game: any) {
  if (game?.productSlug) return game.productSlug;

  const mappings = game?.catalogNs?.mappings;
  if (Array.isArray(mappings) && mappings.length > 0 && mappings[0]?.pageSlug) {
    return mappings[0].pageSlug;
  }

  return null;
}

function getActiveFreeOffer(game: any) {
  const promoGroups = game?.promotions?.promotionalOffers ?? [];
  if (!Array.isArray(promoGroups) || promoGroups.length === 0) return null;

  for (const group of promoGroups) {
    const offers = group?.promotionalOffers ?? [];
    for (const offer of offers) {
      const discount = offer?.discountSetting?.discountPercentage;
      const discountPrice = game?.price?.totalPrice?.discountPrice;

      if (discount === 0 && discountPrice === 0) {
        return offer;
      }
    }
  }

  return null;
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
      const errorText = await epicRes.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: `Epic endpoint failed: ${epicRes.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }

    const epicData = (await epicRes.json()) as EpicApiResponse;
    const elements = epicData?.data?.Catalog?.searchStore?.elements ?? [];

    const rows = elements
      .map((game) => {
        const activeOffer = getActiveFreeOffer(game);
        if (!activeOffer) return null;

        const slug = pickSlug(game);
        const originalPriceCents = game?.price?.totalPrice?.originalPrice ?? 0;
        const currencyCode = game?.price?.totalPrice?.currencyCode ?? "EUR";

        return {
          title: game?.title ?? "Epic Free Game",
          store: "Epic",
          deal_type: "free",
          price_old: Number(originalPriceCents) / 100,
          price_new: 0,
          currency: currencyCode,
          url: slug ? `https://store.epicgames.com/en-US/p/${slug}` : "https://store.epicgames.com/en-US/free-games",
          image_url: pickImage(game?.keyImages ?? []),
          starts_at: activeOffer?.startDate ?? null,
          ends_at: activeOffer?.endDate ?? null,
        };
      })
      .filter(Boolean);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase environment variables",
        },
        { status: 500 }
      );
    }

    // Rimuove i vecchi deal Epic gratuiti per evitare duplicati
    const deleteRes = await fetch(
      `${supabaseUrl}/rest/v1/deals?store=eq.Epic&deal_type=eq.free`,
      {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!deleteRes.ok) {
      const deleteError = await deleteRes.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete old Epic deals",
          details: deleteError,
        },
        { status: 500 }
      );
    }

    if (rows.length > 0) {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/deals`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(rows),
      });

      if (!insertRes.ok) {
        const insertError = await insertRes.text().catch(() => "");
        return NextResponse.json(
          {
            success: false,
            error: "Failed to insert Epic deals",
            details: insertError,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      source: "Epic free games",
      imported: rows.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";

const steamStoreID = 2; // Store ID per Steam
const cheapSharkAPIUrl = "https://www.cheapshark.com/api/1.0/deals"; // CheapShark API URL

// Funzione per ottenere i giochi gratuiti da Steam
const fetchSteamDeals = async () => {
  const response = await fetch(`${cheapSharkAPIUrl}?storeID=${steamStoreID}&upperPrice=0&pageSize=10`);
  const data = await response.json();
  return data;
};

export async function GET() {
  const deals = await fetchSteamDeals();

  const games = deals.map((deal: any) => ({
    title: deal.title,
    store: deal.storeID,
    url: deal.dealID,
    price: deal.price,
    store_name: "Steam",
    release_date: deal.releaseDate,
  }));

  // Salviamo i giochi nel nostro database Supabase
  const { data, error } = await supabase.from("deals").upsert(games, { onConflict: ["title", "store"] });

  if (error) {
    return NextResponse.json({ error: "Errore durante il salvataggio dei giochi su Steam", details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}