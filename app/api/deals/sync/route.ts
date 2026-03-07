import { NextResponse } from "next/server";
import { fetchEpicDeals } from "./epic";  // Questo deve essere presente nella stessa cartella "sync"
import { fetchSteamDeals } from "./steam";  // Questo deve essere presente nella stessa cartella "sync"
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combina i deals
    const allDeals = [...epicDeals, ...steamDeals];

    // Aggiorna nel database
    const { error } = await supabase.from("deals").upsert(allDeals, { onConflict: "deal_id" });
    if (error) {
      console.error("Errore durante l'upsert dei deals:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore durante il recupero dei deals:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}