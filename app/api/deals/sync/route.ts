import { NextResponse } from "next/server";
import { fetchEpicDeals } from "../epic";  
import { fetchSteamDeals } from "../steam";  

export async function GET() {
  try {
    // Fetch dati dai vari store (Epic e Steam)
    const epicDeals = await fetchEpicDeals();
    const steamDeals = await fetchSteamDeals();

    // Combina i dati e ritorna una risposta
    const allDeals = [...epicDeals, ...steamDeals];

    return NextResponse.json(allDeals);
  } catch (error) {
    console.error("Errore nell'API: ", error);
    return NextResponse.json({ error: "Errore nel recupero delle offerte" }, { status: 500 });
  }
}