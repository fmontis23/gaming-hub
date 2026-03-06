"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar() {

  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setLogged(true);
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
        <Link href="/admin">Tornei</Link>
      </div>

      <div className="right">
        {logged ? (
          <Link className="login-btn" href="/profile">
            Profilo
          </Link>
        ) : (
          <Link className="login-btn" href="/profile">
            Login
          </Link>
        )}
      </div>

    </div>
  );
}