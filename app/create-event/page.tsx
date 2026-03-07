"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [registrationsOpenAt, setRegistrationsOpenAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

      setCheckingAuth(false);
    };

    check();
  }, []);

  const announceDiscord = async (content: string) => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Discord announce error:", data);
      alert(
        "Errore invio Discord: " + (data?.details ?? data?.error ?? "unknown")
      );
      return false;
    }

    return true;
  };

  const createEvent = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Devi essere loggato.");
      setLoading(false);
      return;
    }

    if (!title.trim() || !eventDate) {
      alert("Titolo e data/ora evento sono obbligatori.");
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      event_date: new Date(eventDate).toISOString(),
      max_players: maxPlayers,
      created_by: user.id,
      registrations_open_at: registrationsOpenAt
        ? new Date(registrationsOpenAt).toISOString()
        : null,
      registrations_open: false,
    };

    const { data: inserted, error } = await supabase
      .from("events")
      .insert(payload)
      .select("id, title, event_date, max_players, registrations_open_at")
      .single();

    setLoading(false);

    if (error) {
      alert("Errore creazione evento: " + error.message);
      return;
    }

    const openStr = inserted?.registrations_open_at
      ? new Date(inserted.registrations_open_at).toLocaleString()
      : "quando apriamo noi (annuncio in arrivo)";

    const startStr = new Date(inserted.event_date).toLocaleString();

    const content =
      `📢 **Nuovo evento creato!**\n` +
      `🎮 **${inserted.title}**\n` +
      (description.trim() ? `📝 ${description.trim()}\n` : "") +
      `🟡 Iscrizioni: **${openStr}**\n` +
      `⏱️ Inizio evento: **${startStr}**\n` +
      `👥 Max: **${inserted.max_players}**\n` +
      `➡️ Link eventi: ${window.location.origin}/events`;

    await announceDiscord(content);

    alert("Evento creato ✅ (annuncio inviato su Discord)");
    router.push("/events");
  };

  if (checkingAuth) {
    return (
      <main style={{ padding: 40, maxWidth: 560 }}>
        <p>Controllo accesso in corso...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main style={{ padding: 40, maxWidth: 560 }}>
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

        <h1>Crea evento</h1>
        <p style={{ marginTop: 12, color: "#b8b8d0" }}>
          Devi prima effettuare il login con Discord per creare un evento.
        </p>

        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Torna alla home
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 560 }}>
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

      <h1>Crea evento</h1>

      <label style={{ display: "block", marginTop: 12 }}>Titolo</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Es: Ranked Night R6"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <label style={{ display: "block", marginTop: 12 }}>Descrizione</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Es: Team da 5, regole..."
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
          minHeight: 90,
        }}
      />

      <label style={{ display: "block", marginTop: 12 }}>Data e ora evento</label>
      <input
        type="datetime-local"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <label style={{ display: "block", marginTop: 12 }}>
        Iscrizioni aprono (opzionale)
      </label>
      <input
        type="datetime-local"
        value={registrationsOpenAt}
        onChange={(e) => setRegistrationsOpenAt(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Se lo compiliamo, Discord lo mostrerà nell’annuncio. Poi apriremo le
        iscrizioni con un bottone.
      </p>

      <label style={{ display: "block", marginTop: 12 }}>Max giocatori</label>
      <input
        type="number"
        value={maxPlayers}
        onChange={(e) => setMaxPlayers(parseInt(e.target.value || "10", 10))}
        min={2}
        max={100}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <button
        onClick={createEvent}
        disabled={loading}
        style={{
          marginTop: 14,
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #444",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Creazione..." : "Crea evento + annuncio Discord"}
      </button>
    </main>
  );
}