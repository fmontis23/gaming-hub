"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [discordName, setDiscordName] = useState("");
  const [ubisoftName, setUbisoftName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("discord_name, ubisoft_name")
      .eq("id", user.id)
      .single();

    if (data) {
      setDiscordName(data.discord_name || "");
      setUbisoftName(data.ubisoft_name || "");
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        ubisoft_name: ubisoftName,
      })
      .eq("id", user.id);

    if (error) {
      alert("Errore salvataggio: " + error.message);
      return;
    }

    alert("Profilo aggiornato ✅");
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento profilo...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 500 }}>
      <h1>Profilo</h1>

      <label style={{ display: "block", marginTop: 20 }}>
        Nome Discord
      </label>

      <input
        value={discordName}
        disabled
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <label style={{ display: "block", marginTop: 20 }}>
        Nome Ubisoft
      </label>

      <input
        value={ubisoftName}
        onChange={(e) => setUbisoftName(e.target.value)}
        placeholder="Es: MontisR6"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #444",
        }}
      />

      <button
        onClick={saveProfile}
        style={{
          marginTop: 20,
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #444",
          cursor: "pointer",
        }}
      >
        Salva profilo
      </button>
    </main>
  );
}