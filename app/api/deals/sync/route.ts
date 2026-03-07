import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"
    );

    const data = await res.json();

    const games =
      data.data.Catalog.searchStore.elements
        ?.filter((game: any) => game.promotions)
        ?.map((game: any) => ({
          title: game.title,
          image: game.keyImages?.[0]?.url,
          url:
            "https://store.epicgames.com/en-US/p/" +
            game.productSlug,
          price: "FREE",
        })) || [];

    return NextResponse.json({ deals: games });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ deals: [] });
  }
}