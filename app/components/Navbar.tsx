"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data?.user?.id ?? null;
      setUserId(id);
      setLogged(!!id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      setLogged(!!id);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = userId ? ADMIN_IDS.includes(userId) : false;

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert("Errore login Discord: " + error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="navInner">
      <a className="brand" href="/">
        🎮 Gaming Hub
      </a>

      <nav className="navLinks">
        <a href="/">Home</a>
        <a href="/deals">Offerte</a>
        <a href="/events">Eventi/Tornei</a>
        <a href="/profile">Profilo</a>
        {isAdmin && <a href="/admin">Moderatore</a>}

        {!logged ? (
          <button className="btn" onClick={login}>
            Login Discord
          </button>
        ) : (
          <button className="btn" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}