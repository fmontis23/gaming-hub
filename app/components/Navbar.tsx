"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "fmontis23@gmail.com";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (mounted) setIsAdmin(false);
          return;
        }

        const userEmail = user.email ?? "";
        const admin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (mounted) setIsAdmin(admin);
      } catch (error) {
        console.error("Errore controllo admin navbar:", error);
        if (mounted) setIsAdmin(false);
      }
    };

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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