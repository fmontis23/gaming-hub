"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setLogged(!!data?.user);
    };

    checkUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogged(!!session?.user);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const loginWithDiscord = async () => {
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
    <div className="navbar">
      <div className="logo">🎮 Gaming Hub</div>

      <div className="menu">
        <Link href="/">Home</Link>
        <Link href="/deals">Offerte</Link>
        <Link href="/events">Eventi</Link>
        <Link href="/events">Tornei</Link>
      </div>

      <div className="right">
        {logged ? (
          <>
            <Link className="login-btn" href="/profile">
              Profilo
            </Link>

            <button
              onClick={logout}
              className="login-btn"
              style={{
                background: "transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={loginWithDiscord}
            className="login-btn"
            style={{
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Login Discord
          </button>
        )}
      </div>
    </div>
  );
}