"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function parseHash(hash: string) {
  // hash arriva tipo: "#access_token=...&refresh_token=...&token_type=bearer"
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  return {
    access_token: params.get("access_token") || "",
    refresh_token: params.get("refresh_token") || "",
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Accesso in corso...");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // Caso A: code flow (?code=...)
        if (code) {
          setMsg("Scambio code → sessione...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMsg("Errore exchangeCodeForSession: " + error.message);
            return;
          }
        } else {
          // Caso B: implicit flow (#access_token=...)
          const { access_token, refresh_token } = parseHash(window.location.hash);

          if (!access_token || !refresh_token) {
            setMsg("Non trovo access_token/refresh_token nell’URL. Torno alla home.");
            router.replace("/");
            return;
          }

          setMsg("Salvo sessione dai token nell’URL...");
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            setMsg("Errore setSession: " + error.message);
            return;
          }
        }

        // Verifica finale sessione
        const { data } = await supabase.auth.getSession();

        if (data?.session) {
          // pulizia URL (toglie #access_token ecc.)
          window.history.replaceState({}, document.title, "/profile");
          router.replace("/profile");
        } else {
          setMsg("Sessione non trovata dopo login. Torno alla home.");
          router.replace("/");
        }
      } catch (e: any) {
        setMsg("Errore callback: " + (e?.message ?? "unknown"));
      }
    };

    run();
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <h2>{msg}</h2>
    </main>
  );
}