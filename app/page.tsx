"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData?.user ?? null);
    };

    loadUser();
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginTop: 0 }}>🎮 Gaming Hub</h1>

      <p style={{ opacity: 0.85, marginTop: 20 }}>
        Benvenuto nella nostra piattaforma! Scopri eventi, offerte e tornei!
      </p>

      {/* Cards con link a eventi, offerte, tornei */}
      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        <Link href="/events" style={card()}>
          <b>🎮 Eventi</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Partecipa ai tornei e agli eventi gaming della community.
          </div>
        </Link>

        <Link href="/deals" style={card()}>
          <b>💸 Offerte</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Offerte sui giochi, offerte gratuite e tanto altro.
          </div>
        </Link>

        <Link href="/admin" style={card()}>
          <b>🏆 Tornei</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Crea tornei e sfide per la community.
          </div>
        </Link>
      </div>
    </main>
  );
}

function card(): React.CSSProperties {
  return {
    border: "1px solid #444",
    borderRadius: 14,
    padding: 20,
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.05)",
  };
}