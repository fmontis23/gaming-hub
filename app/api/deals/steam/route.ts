import { NextResponse } from "next/server";

type SteamSpecialItem = {
  id: number;
  name: string;
  large_capsule_image?: string;
  header_image?: string;
  mac_header_image?: string;
  linux_header_image?: string;
  windows_available?: boolean;
  mac_available?: boolean;
  linux_available?: boolean;
  discount_percent?: number;
  original_price?: number;
  final_price?: number;
};

export async function GET() {
  try {
    const res = await fetch(
      "https://store.steampowered.com/api/featuredcategories?cc=it&l=italian",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Errore recupero deals Steam");
    }

    const data = await res.json();

    const specials: SteamSpecialItem[] = data?.specials?.items || [];

    const deals = specials.map((game) => {
      const originalPrice = typeof game.original_price === "number"
        ? game.original_price / 100
        : null;

      const finalPrice = typeof game.final_price === "number"
        ? game.final_price / 100
        : null;

      return {
        id: `steam-${game.id}`,
        title: game.name,
        image:
          game.large_capsule_image ||
          game.header_image ||
          game.mac_header_image ||
          game.linux_header_image ||
          "",
        url: `https://store.steampowered.com/app/${game.id}`,
        price:
          finalPrice === 0
            ? "FREE"
            : finalPrice !== null
            ? `€${finalPrice.toFixed(2)}`
            : "Offerta",
        original_price:
          originalPrice !== null ? `€${originalPrice.toFixed(2)}` : null,
        discount_percent:
          typeof game.discount_percent === "number"
            ? game.discount_percent
            : 0,
        store: "Steam",
        platform: "Steam",
        start_date: null,
        end_date: null,
        is_free: finalPrice === 0,
      };
    });

    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Errore Steam deals:", error);
    return NextResponse.json({ deals: [] }, { status: 200 });
  }
}