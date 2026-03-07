import { NextResponse } from "next/server";
import { fetchEpicDeals } from "../epic";  // Corretto
import { fetchSteamDeals } from "../steam"; // Corretto
import { supabase } from "../../../lib/supabaseClient"; // Corretto

const cheapSharkAPIUrl = "https://www.cheapshark.com/api/1.0/deals"; // CheapShark API URL
const epicStoreID = 1;  // Store ID per Epic
const steamStoreID = 2; // Store ID per Steam

export const GET = async () => {
  // Recupera i deals da Epic e Steam
  const epicDeals = await fetchEpicDeals();
  const steamDeals = await fetchSteamDeals();

  const deals = [...epicDeals, ...steamDeals];

  // Aggiungi i deals a Supabase
  const { error } = await supabase.from("deals").upsert(deals, {
    onConflict: ["id"],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
};