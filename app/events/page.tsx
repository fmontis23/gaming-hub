"use client";

import { useEffect, useState, useMemo } from "react";
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
};

type ParticipantRow = {
  id: string;
  event_id: string;
  user_id: string;
  role: string | null;
  status: string | null;
};

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;

      if (!authUser) {
        router.replace("/");
        return;
      }

      setMyUserId(authUser.id);

      await loadEventsData();
      setLoading(false);
    };

    init();
  }, [router]);

  const loadEventsData = async () => {
    const { data: ev } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    setEvents(ev ?? []);

    const { data: part } = await supabase
      .from("event_participants")
      .select("*");

    setParticipants(part ?? []);
  };

  const joinEvent = async (event: EventRow) => {
    if (!myUserId) return;

    const { error } = await supabase
      .from("event_participants")
      .insert({ event_id: event.id, user_id: myUserId, role: "player", status: "joined" });

    if (error) {
      alert("Errore partecipazione: " + error.message);
      return;
    }

    await loadEventsData();
  };

  const leaveEvent = async (eventId: string) => {
    if (!myUserId) return;

    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", myUserId);

    if (error) {
      alert("Errore annullamento: " + error.message);
      return;
    }

    await loadEventsData();
  };

  const announceDiscord = async (content: string) => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert("Errore invio Discord: " + (data?.details ?? data?.error ?? "unknown"));
      return false;
    }
    return true;
  };

  const openRegistrations = async (event: EventRow) => {
    if (!myUserId || event.created_by !== myUserId) {
      alert("Solo il creatore dell'evento può aprire le iscrizioni.");
      return;
    }

    const { error } = await supabase
      .from("events")
      .update({ registrations_open: true })
      .eq("id", event.id);

    if (error) {
      alert("Errore apertura iscrizioni: " + error.message);
      return;
    }

    const content = `🟢 **Iscrizioni aperte!**\n` +
      `🎮 **${event.title}**\n` +
      `📅 ${new Date(event.event_date).toLocaleString()}\n` +
      `👥 Max: **${event.max_players}**\n` +
      `➡️ Iscriviti sul sito: ${window.location.origin}/events`;

    await announceDiscord(content);
    await loadEventsData();
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento eventi...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Eventi disponibili</h1>
      {events.length === 0 && <p>Nessun evento creato.</p>}

      {events.map((event) => {
        const participantsCount = participants.filter(p => p.event_id === event.id).length;
        const isJoined = participants.some(p => p.event_id === event.id && p.user_id === myUserId);
        const isCreator = event.created_by === myUserId;

        return (
          <div key={event.id} style={{ border: "1px solid #444", borderRadius: 10, padding: 20, marginTop: 20 }}>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>📅 {new Date(event.event_date).toLocaleString()}</p>
            <p>👥 Partecipanti: {participantsCount} / {event.max_players}</p>
            <p>🟢 Iscrizioni: {event.registrations_open ? "APERTE" : "CHIUSE"}</p>

            {!isJoined ? (
              <button onClick={() => joinEvent(event)} disabled={!event.registrations_open}>
                {event.registrations_open ? "Partecipa" : "Iscrizioni chiuse"}
              </button>
            ) : (
              <button onClick={() => leaveEvent(event.id)}>Annulla partecipazione</button>
            )}

            {isCreator && !event.registrations_open && (
              <button onClick={() => openRegistrations(event)}>
                Apri iscrizioni + annuncio Discord
              </button>
            )}
          </div>
        );
      })}
    </main>
  );
}