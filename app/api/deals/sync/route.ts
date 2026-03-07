import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=60&pageSize=20");
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error fetching deals:", errorText);
      return NextResponse.json({ success: false, error: errorText });
    }

    const deals = await res.json();

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    for (const deal of deals) {
      const data = {
        title: deal.title,
        store: "Steam",
        deal_type: "sale",
        price_old: Number(deal.normalPrice),
        price_new: Number(deal.salePrice),
        url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        image_url: deal.thumb,
      };

      await fetch(`${SUPABASE_URL}/rest/v1/deals`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(data)
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({
      success: false,
      error: `Error occurred: ${err}`,
    });
  }
}