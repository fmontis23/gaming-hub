import { NextResponse } from "next/server";
import { fetchEpicDeals } from "./epic";
import { fetchSteamDeals } from "./steam";
import { supabase } from "../../../lib/supabaseClient";

export const GET = async () => {
  try {
    // Recupero le offerte da Epic e Steam
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combina le offerte di Epic e Steam
    const allDeals = [...epicDeals, ...steamDeals];

    // Salva nel database (tabella 'deals')
    const { error } = await supabase.from("deals").upsert(allDeals);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, deals: allDeals });
  } catch (error: any) {
    console.error("Errore nel recupero delle offerte:", error.message);
    return NextResponse.json({ error: "Errore nel recupero delle offerte" }, { status: 500 });
  }
};