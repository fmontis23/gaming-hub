"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  registrations_open: boolean;
  created_by: string;
};

export default function AdminEventsPage() {
  const [logged, setLogged] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    setLogged(!!auth?.user);

    const { data, error } = await supabase
      .from("events")
      .select("id,title,event_date,registrations_open,created_by")
      .order("event_date", { ascending: true });

    if (error) {
      alert("Errore caricamento eventi: " + error.message);
      setEvents([]);
    } else {
      setEvents((data as EventRow[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteEvent = async (ev: EventRow) => {
    if (!logged) return alert("Devi essere loggato.");
    if (!confirm(`Eliminare evento "${ev.title}"? (Cancella anche iscrizioni/squadre)`)) return;

    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) return alert("Errore eliminazione: " + error.message);

    await load();
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Admin • Eventi</h1>

      {!logged && <p style={{ opacity: 0.85 }}>Fai login dalla Home, poi torna qui.</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button
          onClick={load}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
        >
          Ricarica
        </button>

        <a
          href="/create-event"
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", textDecoration: "none", color: "inherit" }}
        >
          Crea evento
        </a>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Caricamento…</p>
      ) : events.length === 0 ? (
        <p style={{ marginTop: 16 }}>Nessun evento.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {events.map((ev) => (
            <div key={ev.id} style={{ border: "1px solid #444", borderRadius: 12, padding: 14 }}>
              <b>{ev.title}</b>
              <div style={{ opacity: 0.85, marginTop: 6 }}>
                📅 {new Date(ev.event_date).toLocaleString()}
              </div>
              <div style={{ opacity: 0.85 }}>
                Iscrizioni: {ev.registrations_open ? "APERTE" : "CHIUSE"}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href="/events"
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #444", textDecoration: "none", color: "inherit" }}
                >
                  Vai a eventi
                </a>
                <button
                  onClick={() => deleteEvent(ev)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}