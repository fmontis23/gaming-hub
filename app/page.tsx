"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const [logged, setLogged] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;

      // Se non loggato, rimandiamo alla home
      if (!authUser) {
        setLogged(false);
        return;
      }

      setLogged(true);

      // Verifica profilo completo
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("ubisoft_nickname, platform")
        .eq("auth_user_id", authUser.id)
        .single();

      // Se profilo non completo, reindirizza a /profile
      if (profileError || !profile?.ubisoft_nickname || !profile?.platform) {
        setProfileCompleted(false);
        router.replace("/profile");
      } else {
        setProfileCompleted(true);
      }
    };

    init();
  }, [router]);

  const goToEvents = () => {
    if (!logged || !profileCompleted) {
      alert("Devi completare il profilo prima di accedere agli eventi.");
      return;
    }
    router.push("/events");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Benvenuto su Gaming Hub</h1>
      {logged ? (
        profileCompleted ? (
          <div>
            <p>
              Il tuo profilo è completo! Puoi accedere agli eventi e tornei.
            </p>
            <button onClick={goToEvents}>Vai agli eventi</button>
          </div>
        ) : (
          <p>
            Completa il tuo profilo per sbloccare gli eventi e tornei!{" "}
            <a href="/profile">Completa il profilo</a>
          </p>
        )
      ) : (
        <p>
          Per favore, <a href="/auth/callback">fai login con Discord</a> per
          continuare.
        </p>
      )}
    </main>
  );
}