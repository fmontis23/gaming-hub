"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const metadata = {
  title: "Gaming Hub",
  description: "Community gaming con eventi, squadre e offerte sui giochi.",
  openGraph: {
    title: "Gaming Hub",
    description:
      "Partecipa agli eventi della community, trova giochi gratis e gioca con altri gamer.",
    url: "https://gamehubitalia.it",
    siteName: "Gaming Hub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

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

      const discordName =
        user.user_metadata?.user_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        email;

      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        display_name: discordName,
        discord_name: discordName,
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