"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient"; // assicurati di avere questo import corretto

export default function Navbar() {
  const [logged, setLogged] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setLogged(true);
        // Verifica se il profilo è completo (modifica questa logica in base al tuo DB)
        const { data, error } = await supabase
          .from("users")
          .select("profile_complete")
          .eq("id", user.id)
          .single();
        if (data?.profile_complete) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      } else {
        setLogged(false);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="navbar">
      <div className="logo">
        🎮 Gaming Hub
      </div>

      <div className="menu">
        <Link href="/">Home</Link>
        <Link href="/deals">Offerte</Link>
        <Link href="/events">Eventi</Link>
        {logged && profileComplete ? (
          <Link href="/admin">Tornei</Link>
        ) : null}
      </div>

      <div className="right">
        {logged ? (
          <Link className="login-btn" href="/profile">
            Profilo
          </Link>
        ) : (
          <Link className="login-btn" href="/auth/callback">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}