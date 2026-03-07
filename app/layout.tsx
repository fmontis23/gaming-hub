"use client";

import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const syncProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      const email = user.email ?? "";
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        email;

      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        display_name: displayName,
      });
    };

    syncProfile();
  }, []);

  return (
    <html lang="it">
      <body>
        <div className="nav">
          <Navbar />
        </div>

        <div className="container">{children}</div>
      </body>
    </html>
  );
}