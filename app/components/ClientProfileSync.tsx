"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientProfileSync() {
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

  return null;
}