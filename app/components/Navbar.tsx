"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "fmontis23@gmail.com";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      const email = user.email ?? "";

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      }
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
          <Link href="/deals">Offerte</Link>
          <Link href="/events">Eventi</Link>

          {isAdmin && (
            <Link href="/core-control">Moderatore</Link>
          )}
        </nav>

        <div className="site-actions">

          <a
            href="https://discord.gg/4NrqDfgP"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-button"
          >
            Unisciti al Discord
          </a>

          <Link href="/profile" className="profile-button">
            Profilo
          </Link>

        </div>

      </div>
    </header>
  );
}