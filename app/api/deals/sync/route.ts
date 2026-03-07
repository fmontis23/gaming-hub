import { NextResponse } from "next/server";
import { fetchEpicDeals } from "../../../epic";
import { fetchSteamDeals } from "../../../steam";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  try {
    // Recupero le offerte da Epic e Steam
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    const allDeals = [...epicDeals, ...steamDeals];

    // Ordino le offerte per data di scadenza
    const sortedDeals = allDeals.sort((a, b) => new Date(a.dealEnds).getTime() - new Date(b.dealEnds).getTime());

    // Salvo tutte le offerte su Supabase
    const { error } = await supabase.from("deals").upsert(sortedDeals, {
      onConflict: "id", // evita duplicati
    });

    if (error) {
      console.error("Errore nel salvataggio delle offerte", error);
      return NextResponse.json({ error: "Errore nel salvataggio delle offerte" }, { status: 500 });
    }

    return NextResponse.json({ deals: sortedDeals });
  } catch (error) {
    console.error("Errore nel recupero delle offerte:", error);
    return NextResponse.json({ error: "Errore nel recupero delle offerte" }, { status: 500 });
  }
}