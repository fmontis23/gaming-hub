"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        setLoadingAdmin(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            setIsAdmin(false);
            setLoadingAdmin(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("admins")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Errore controllo admin navbar:", error.message);
          if (mounted) {
            setIsAdmin(false);
            setLoadingAdmin(false);
          }
          return;
        }

        if (mounted) {
          setIsAdmin(!!data);
          setLoadingAdmin(false);
        }
      } catch (error) {
        console.error("Errore navbar admin:", error);
        if (mounted) {
          setIsAdmin(false);
          setLoadingAdmin(false);
        }
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
          {!loadingAdmin && isAdmin && <Link href="/admin">Moderatore</Link>}
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