import { NextResponse } from "next/server";
import { fetchEpicDeals } from "./epic";  // 
import { fetchSteamDeals } from "./steam"; // 
import { supabase } from "../../../lib/supabaseClient";

export const GET = async () => {
  try {
    // Recupera i deals da Epic e Steam
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combina i deals da Epic e Steam
    const deals = [...epicDeals, ...steamDeals];

    // Aggiungi i deals a Supabase
    const { error } = await supabase
      .from("deals")
      .upsert(deals, { onConflict: ["id"] });

    if (error) {
      throw new Error(error.message);
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
};