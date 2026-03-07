import { NextResponse } from "next/server";
import { fetchEpicDeals } from "../sync/epic";
import { fetchSteamDeals } from "../sync/steam";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combina i deals
    const allDeals = [...epicDeals, ...steamDeals];

    // Aggiorna nel database
    const { error } = await supabase.from("deals").upsert(allDeals, { onConflict: ["deal_id"] });
    if (error) {
      console.error("Errore durante l'upsert dei deals:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore durante il recupero dei deals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}