"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type DbUser = {
  id: string;
  auth_user_id: string | null;
  discord_username: string | null;
  avatar: string | null;
  ubisoft_nickname: string | null;
  rank: string | null;
  platform: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  const [ubisoftNickname, setUbisoftNickname] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [rank, setRank] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace("/"); // Redirect if not logged in
        return;
      }

      const u = data.user;
      setAuthUser(u);

      const discordUsername =
        u.user_metadata?.global_name ||
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.user_metadata?.preferred_username ||
        "Utente";

      const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;

      // Crea/aggiorna riga utente (upsert)
      const { error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            auth_user_id: u.id,
            discord_username: discordUsername,
            avatar,
          },
          { onConflict: "auth_user_id" }
        );

      if (upsertError) console.error("upsert:", upsertError.message);

      // Leggi riga dal DB
      const { data: row, error: readError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", u.id)
        .single();

      if (readError) {
        console.error("read:", readError.message);
      } else {
        setDbUser(row as DbUser);
        setUbisoftNickname(row?.ubisoft_nickname ?? "");
        setPlatform(row?.platform ?? "PC");
        setRank(row?.rank ?? "");
      }

      setLoading(false);

      // Verifica se il profilo è completo, se no reindirizza
      if (!row?.ubisoft_nickname || !row?.platform) {
        alert("Completa il tuo profilo per accedere agli eventi.");
        router.replace("/profile");
      }
    };

    load();
  }, [router]);

  const saveGamingInfo = async () => {
    if (!authUser) return;

    const { error } = await supabase
      .from("users")
      .update({
        ubisoft_nickname: ubisoftNickname.trim(),
        platform,
        rank: rank.trim(),
      })
      .eq("auth_user_id", authUser.id);

    if (error) return alert("Errore salvataggio: " + error.message);

    alert("Dati salvati ✅");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento profilo...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 520 }}>
      <h1>Profilo</h1>
      <p>
        Loggato come: <b>{dbUser?.discord_username ?? "utente"}</b>
      </p>

      <hr style={{ margin: "16px 0" }} />

      <h2>Dati Gaming</h2>
      <label style={{ display: "block", marginTop: 12 }}>Nickname Ubisoft</label>
      <input
        value={ubisoftNickname}
        onChange={(e) => setUbisoftNickname(e.target.value)}
        placeholder="Es: Fmontis23"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
      />

      <label style={{ display: "block", marginTop: 12 }}>Piattaforma</label>
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
      >
        <option>PC</option>
        <option>PlayStation</option>
        <option>Xbox</option>
      </select>

      <label style={{ display: "block", marginTop: 12 }}>Rank (opzionale)</label>
      <input
        value={rank}
        onChange={(e) => setRank(e.target.value)}
        placeholder="Es: Emerald / Diamond / Champ..."
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
      />

      <button
        onClick={saveGamingInfo}
        style={{
          marginTop: 14,
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #444",
          cursor: "pointer",
        }}
      >
        Salva
      </button>

      <hr style={{ margin: "16px 0" }} />

      <button
        onClick={logout}
        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
      >
        Logout
      </button>
    </main>
  );
}