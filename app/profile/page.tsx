"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();

  const [discordName, setDiscordName] = useState("");
  const [ubisoftName, setUbisoftName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    const user = auth?.user;

    if (authError || !user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("discord_name, ubisoft_name")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Errore caricamento profilo:", error.message);
      setDiscordName("");
      setUbisoftName("");
      setLoading(false);
      return;
    }

    setDiscordName(data?.discord_name || "");
    setUbisoftName(data?.ubisoft_name || "");
    setLoading(false);
  };

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      alert("Errore login Discord: " + error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Errore logout: " + error.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const saveProfile = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Devi essere loggato.");
      return;
    }

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

  if (!isLoggedIn) {
    return (
      <main style={{ padding: 40, maxWidth: 500 }}>
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

        <h1>Profilo</h1>

        <p style={{ marginTop: 12, color: "#b8b8d0" }}>
          Devi prima fare login con Discord per vedere e modificare il profilo.
        </p>

        <button
          onClick={loginWithDiscord}
          style={{
            marginTop: 20,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#5865f2",
            color: "white",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Login con Discord
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 500 }}>
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

      <h1>Profilo</h1>

      <label style={{ display: "block", marginTop: 20 }}>Nome Discord</label>

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

      <label style={{ display: "block", marginTop: 20 }}>Nome Ubisoft</label>

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

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <button
          onClick={saveProfile}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Salva profilo
        </button>

        <button
          onClick={logout}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #444",
            background: "#2b2b35",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}