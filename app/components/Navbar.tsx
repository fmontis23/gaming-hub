"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Errore controllo admin navbar:", error.message);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    checkAdmin();
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-brand">
          <Link href="/" className="brand-link">
            <span className="brand-icon">🎮</span>
            <span className="brand-text">Gaming Hub</span>
          </Link>
        </div>

        <nav className="site-nav">
          <Link href="/">Home</Link>
          <Link href="/events">Eventi</Link>
          <Link href="/deals">Deals</Link>
          <Link href="/community">Community</Link>
          {isAdmin && <Link href="/admin">Moderatore</Link>}
        </nav>

        <div className="site-actions">
          <a
            href="https://discord.gg/4NrqDfgP"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-button"
          >
            Discord
          </a>

          <Link href="/profile" className="profile-button">
            Profilo
          </Link>
        </div>
      </div>
    </header>
  );
}