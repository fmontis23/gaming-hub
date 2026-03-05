"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Deal = {
  id: string;
  title: string;
  store: string;
};

type Event = {
  id: string;
  title: string;
  event_date: string;
};

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadDeals();
    loadEvents();
  }, []);

  const loadDeals = async () => {
    const { data } = await supabase
      .from("deals")
      .select("id,title,store")
      .limit(5);

    if (data) setDeals(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id,title,event_date")
      .limit(5);

    if (data) setEvents(data);
  };

  return (
    <main style={{ padding: 30 }}>

      <h1>🎮 Gaming Hub</h1>
      <p>Community gaming + tornei + giochi gratis PC</p>

      <h2 style={{ marginTop: 30 }}>🎁 Giochi gratis / Deals</h2>

      {deals.map((deal) => (
        <div key={deal.id} style={{
          border: "1px solid #444",
          padding: 10,
          borderRadius: 10,
          marginTop: 8
        }}>
          {deal.title} — {deal.store}
        </div>
      ))}

      <h2 style={{ marginTop: 30 }}>🏆 Prossimi Eventi</h2>

      {events.map((event) => (
        <div key={event.id} style={{
          border: "1px solid #444",
          padding: 10,
          borderRadius: 10,
          marginTop: 8
        }}>
          {event.title} — {new Date(event.event_date).toLocaleDateString()}
        </div>
      ))}

    </main>
  );
}