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
      .select("id,title,store,deal_type,price_old,price_new,currency,url,ends_at,created_at")
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

      <h1 style={{ marginTop: 0 }}>💸 Offerte & giochi gratis (PC)</h1>

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
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((d) => (
            <a
              key={d.id}
              href={d.url}
              target="_blank"
              rel="noreferrer"
              style={{
                border: "1px solid #444",
                borderRadius: 12,
                padding: 14,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <b>{d.title}</b>

              <div style={{ opacity: 0.85, marginTop: 6 }}>
                {d.store} • {d.deal_type === "free" ? "Gratis" : "Sconto"}
              </div>

              {d.deal_type !== "free" && (
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  {d.price_old != null ? (
                    <span style={{ textDecoration: "line-through" }}>{d.price_old} </span>
                  ) : null}
                  {d.price_new != null ? <b>{d.price_new}</b> : null} {d.currency ?? "EUR"}
                </div>
              )}

              {d.ends_at && (
                <div style={{ marginTop: 8, opacity: 0.8 }}>
                  Scade: {new Date(d.ends_at).toLocaleString()}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}