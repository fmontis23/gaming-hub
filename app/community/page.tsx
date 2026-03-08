"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CommunityPage() {
  const [users, setUsers] = useState(0);
  const [events, setEvents] = useState(0);
  const [teams, setTeams] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    const { count: teamsCount } = await supabase
      .from("event_teams")
      .select("*", { count: "exact", head: true });

    setUsers(usersCount || 0);
    setEvents(eventsCount || 0);
    setTeams(teamsCount || 0);

    setLoading(false);
  };

  if (loading) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        Caricamento community...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        background:
          "radial-gradient(circle at top, rgba(88,101,242,0.18), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
        color: "white",
      }}
    >
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 30,
          borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>🌍 Community</h1>

        <p style={{ color: "#b8b8d0", marginBottom: 30 }}>
          Alcune statistiche della nostra community gaming.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0 }}>{users}</h2>
            <p style={{ margin: 0, color: "#b8b8d0" }}>Utenti registrati</p>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0 }}>{events}</h2>
            <p style={{ margin: 0, color: "#b8b8d0" }}>Eventi creati</p>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0 }}>{teams}</h2>
            <p style={{ margin: 0, color: "#b8b8d0" }}>Squadre generate</p>
          </div>
        </div>
      </section>
    </main>
  );
}