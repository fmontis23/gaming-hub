"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = userId ? ADMIN_IDS.includes(userId) : false;

  return (
    <header style={header()}>
      <a href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 900 }}>
        🎮 Gaming Hub
      </a>

      <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <a href="/deals" style={link()}>Deals</a>
        <a href="/events" style={link()}>Eventi</a>
        <a href="/profile" style={link()}>Profilo</a>
        {isAdmin && <a href="/admin" style={link()}>Moderatore</a>}
      </nav>
    </header>
  );
}

function header(): React.CSSProperties {
  return {
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #333",
    position: "sticky",
    top: 0,
    background: "#0b0b0b",
    zIndex: 10,
  };
}
function link(): React.CSSProperties {
  return { color: "inherit", textDecoration: "none", opacity: 0.9 };
}