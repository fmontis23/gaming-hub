import { NextResponse } from "next/server";
import { fetchEpicDeals } from "../epic";
import { fetchSteamDeals } from "../steam";
import { supabase } from "../../../lib/supabaseClient";

// Funzione per recuperare le offerte di Epic e Steam
export async function GET() {
  try {
    // Recupero le offerte da Epic e Steam
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combino le offerte di Epic e Steam
    const allDeals = [...epicDeals, ...steamDeals];

    // Ordino le offerte per data di scadenza (puoi modificare questo ordinamento)
    const sortedDeals = allDeals.sort((a, b) => {
      return new Date(a.dealEnds).getTime() - new Date(b.dealEnds).getTime();
    });

    // Ritorno i risultati come risposta JSON
    return NextResponse.json({ deals: sortedDeals });
  } catch (error) {
    console.error("Errore nel recupero delle offerte: ", error);
    return NextResponse.json({ error: "Errore nel recupero delle offerte" }, { status: 500 });
  }
}