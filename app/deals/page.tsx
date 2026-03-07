"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Deal = {
  id: string;
  title: string;
  store: string;
  deal_type: "free" | "discount" | string;
  price_old: number | null;
  price_new: number | null;
  currency: string | null;
  url: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
};

export default function DealsPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [store, setStore] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("deals")
      .select(
        "id,title,store,deal_type,price_old,price_new,currency,url,image_url,starts_at,ends_at,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert("Errore caricamento deals: " + error.message);
      setDeals([]);
    } else {
      setDeals((data as Deal[]) ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const stores = useMemo(() => {
    return Array.from(new Set(deals.map((d) => d.store))).sort();
  }, [deals]);

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      const storeOk = store === "all" || d.store === store;
      const typeOk = type === "all" || d.deal_type === type;
      return storeOk && typeOk;
    });
  }, [deals, store, type]);

  return (
    <main style={{ padding: 40 }}>
      <button
        onClick={() => router.back()}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #444",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Indietro
      </button>

      <h1 style={{ marginTop: 0 }}>💸 Offerte & giochi gratis</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <label>
          Store{" "}
          <select value={store} onChange={(e) => setStore(e.target.value)}>
            <option value="all">Tutti</option>
            {stores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo{" "}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Tutti</option>
            <option value="free">Gratis</option>
            <option value="discount">Sconto</option>
          </select>
        </label>

        <button
          onClick={loadDeals}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Aggiorna
        </button>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Caricamento…</p>
      ) : filtered.length === 0 ? (
        <p style={{ marginTop: 16 }}>Nessuna offerta al momento.</p>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((d) => (
            <a
              key={d.id}
              href={d.url}
              target="_blank"
              rel="noreferrer"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {d.image_url ? (
                <div
                  style={{
                    height: 160,
                    backgroundImage: `url(${d.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 42,
                  }}
                >
                  🎮
                </div>
              )}

              <div style={{ padding: 14 }}>
                <b style={{ display: "block", fontSize: 18 }}>{d.title}</b>

                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  {d.store} • {d.deal_type === "free" ? "Gratis" : "Sconto"}
                </div>

                <div style={{ marginTop: 10 }}>
                  {d.deal_type === "free" ? (
                    <>
                      {d.price_old != null && d.price_old > 0 ? (
                        <div style={{ opacity: 0.75 }}>
                          Prezzo iniziale:{" "}
                          <span style={{ textDecoration: "line-through" }}>
                            {d.price_old.toFixed(2)} {d.currency ?? "EUR"}
                          </span>
                        </div>
                      ) : null}

                      <div style={{ fontWeight: 800, marginTop: 4 }}>
                        Ora: GRATIS
                      </div>
                    </>
                  ) : (
                    <>
                      {d.price_old != null ? (
                        <span style={{ textDecoration: "line-through", opacity: 0.75 }}>
                          {d.price_old.toFixed(2)}{" "}
                        </span>
                      ) : null}
                      {d.price_new != null ? (
                        <b>{d.price_new.toFixed(2)}</b>
                      ) : null}{" "}
                      {d.currency ?? "EUR"}
                    </>
                  )}
                </div>

                {d.ends_at && (
                  <div style={{ marginTop: 10, opacity: 0.8 }}>
                    Scade: {new Date(d.ends_at).toLocaleString()}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}