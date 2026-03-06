"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  max_players: number;
  created_by: string;
  registrations_open: boolean;
  registrations_open_at: string | null;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  user_id: string;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: ev } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      setEvents(ev as EventRow[]);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #444",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          ← Indietro
        </button>

        <p>Caricamento eventi...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <button
        onClick={() => router.back()}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #444",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Indietro
      </button>

      <h1>🎮 Eventi disponibili</h1>

      {events.length === 0 && <p>Nessun evento creato.</p>}

      {events.map((event) => {
        return (
          <div
            key={event.id}
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: 20,
              marginTop: 20,
            }}
          >
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>📅 {new Date(event.event_date).toLocaleString()}</p>
          </div>
        );
      })}
    </main>
  );
}