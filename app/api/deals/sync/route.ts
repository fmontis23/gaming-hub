import { NextResponse } from "next/server";

type EpicGame = {
  title?: string;
  productSlug?: string | null;
  offerMappings?: { pageSlug?: string | null }[];
  catalogNs?: { mappings?: { pageSlug?: string | null }[] };
  keyImages?: { url?: string }[];
  promotions?: {
    promotionalOffers?: {
      promotionalOffers?: {
        startDate?: string;
        endDate?: string;
      }[];
    }[];
    upcomingPromotionalOffers?: {
      promotionalOffers?: {
        startDate?: string;
        endDate?: string;
      }[];
    }[];
  };
  price?: {
    totalPrice?: {
      discountPrice?: number;
      originalPrice?: number;
    };
  };
};

function getGameSlug(game: EpicGame) {
  if (game.productSlug) return game.productSlug;

  const offerSlug = game.offerMappings?.[0]?.pageSlug;
  if (offerSlug) return offerSlug;

  const mappingSlug = game.catalogNs?.mappings?.[0]?.pageSlug;
  if (mappingSlug) return mappingSlug;

  return null;
}

function getCurrentPromotion(game: EpicGame) {
  return game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] || null;
}

function isCurrentlyFree(game: EpicGame) {
  const currentPromo = getCurrentPromotion(game);
  const discountPrice = game.price?.totalPrice?.discountPrice;

  return !!currentPromo && discountPrice === 0;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=it-IT&country=IT&allowCountries=IT",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Errore recupero dati Epic");
    }

    const data = await res.json();

    const elements: EpicGame[] =
      data?.data?.Catalog?.searchStore?.elements || [];

    const games = elements
      .filter((game) => isCurrentlyFree(game))
      .map((game) => {
        const currentPromo = getCurrentPromotion(game);
        const slug = getGameSlug(game);

        return {
          id: slug || game.title || crypto.randomUUID(),
          title: game.title || "Gioco senza titolo",
          image: game.keyImages?.[0]?.url || "",
          url: slug
            ? `https://store.epicgames.com/it/p/${slug}`
            : "https://store.epicgames.com/it/",
          price: "FREE",
          store: "Epic Games",
          platform: "Epic",
          start_date: currentPromo?.startDate || null,
          end_date: currentPromo?.endDate || null,
        };
      })
      .filter((game) => game.title && game.url);

    return NextResponse.json({ deals: games });
  } catch (error) {
    console.error("Errore deals sync:", error);
    return NextResponse.json({ deals: [] }, { status: 200 });
  }
}