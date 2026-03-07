"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "fmontis23@gmail.com";

export default function AdminDashboard() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      const userEmail = data.user.email ?? "";

      if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setCheckingAuth(false);
    };

    checkAdmin();
  }, []);

  const sendTestDiscordMessage = async () => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "🚨 Evento di Test",
        description:
          "Le iscrizioni per il torneo **Rainbow Six Siege 5v5** sono aperte!\n\n📅 Oggi alle 21:00\n👥 10 posti disponibili\n\nIscriviti subito!",
        url: "https://gaming-hub-lime.vercel.app/events",
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("Errore Discord: " + (data?.details || data?.error || "unknown"));
      return;
    }

    alert("Messaggio Discord inviato ✅");
  };

  if (checkingAuth) {
    return (
      <main style={{ padding: 24 }}>
        <p>Controllo accesso moderatore...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
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

        <div
          style={{
            border: "1px solid #444",
            borderRadius: 14,
            padding: 20,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Accesso riservato</h1>
          <p style={{ opacity: 0.85 }}>
            Questa area moderatore è disponibile solo per l&apos;account autorizzato.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
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

      <h1 style={{ marginTop: 0 }}>🛠 Dashboard Moderatore</h1>
      <p style={{ opacity: 0.85 }}>
        Area privata moderatore. Da qui gestisci eventi, tornei, deals e annunci Discord.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <a href="/create-event" style={card()}>
          <b>➕ Crea Evento</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Crea un nuovo evento e invia l&apos;annuncio su Discord
          </div>
        </a>

        <a href="/events" style={card()}>
          <b>🎮 Eventi pubblici</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Controlla come gli utenti vedono gli eventi
          </div>
        </a>

        <a href="/deals" style={card()}>
          <b>🎁 Deals pubblici</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Controlla i giochi gratis e le offerte sul sito
          </div>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={sendTestDiscordMessage}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Invia test Discord
        </button>
      </div>
    </main>
  );
}

function card(): React.CSSProperties {
  return {
    border: "1px solid #444",
    borderRadius: 14,
    padding: 14,
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.02)",
  };
}