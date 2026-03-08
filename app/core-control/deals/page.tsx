"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Deal = {
  id: string;
  title: string;
  store: string;
  deal_type: string;
  url: string;
  created_at: string | null;
};

export default function AdminDealsPage() {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  const [title, setTitle] = useState("");
  const [store, setStore] = useState("Steam");
  const [dealType, setDealType] = useState<"free" | "discount">("free");
  const [url, setUrl] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceOld, setPriceOld] = useState("");
  const [priceNew, setPriceNew] = useState("");

  const [list, setList] = useState<Deal[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogged(!!data?.user));
    loadList();
  }, []);

  const loadList = async () => {
    const { data, error } = await supabase
      .from("deals")
      .select("id,title,store,deal_type,url,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error.message);
      setList([]);
    } else {
      setList((data as Deal[]) ?? []);
    }
  };

  const addDeal = async () => {
    if (!logged) return alert("Devi essere loggato.");
    if (!title.trim() || !store.trim() || !url.trim()) return alert("Titolo, store e URL sono obbligatori.");

    setLoading(true);

    const payload: any = {
      title: title.trim(),
      store: store.trim(),
      deal_type: dealType,
      url: url.trim(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      currency: "EUR",
      price_old: null,
      price_new: null,
    };

    if (dealType === "discount") {
      payload.price_old = priceOld ? Number(priceOld) : null;
      payload.price_new = priceNew ? Number(priceNew) : null;
    }

    const { error } = await supabase.from("deals").insert(payload);

    setLoading(false);

    if (error) return alert("Errore inserimento: " + error.message);

    alert("Offerta aggiunta ✅");
    setTitle("");
    setUrl("");
    setEndsAt("");
    setPriceOld("");
    setPriceNew("");
    await loadList();
  };

  const deleteDeal = async (id: string) => {
    if (!logged) return alert("Devi essere loggato.");
    if (!confirm("Eliminare questa offerta?")) return;

    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) return alert("Errore eliminazione: " + error.message);

    await loadList();
  };

  const deleteMany = async () => {
    if (!logged) return alert("Devi essere loggato.");
    if (!confirm("Eliminare le PRIME 20 offerte della lista?")) return;

    const ids = list.slice(0, 20).map((d) => d.id);
    if (ids.length === 0) return;

    const { error } = await supabase.from("deals").delete().in("id", ids);
    if (error) return alert("Errore eliminazione multipla: " + error.message);

    await loadList();
  };

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ marginTop: 0 }}>Admin • Offerte</h1>

      {!logged && <p style={{ opacity: 0.85 }}>Fai login dalla Home, poi torna qui.</p>}

      <div style={{ border: "1px solid #444", borderRadius: 12, padding: 14, maxWidth: 560 }}>
        <label style={{ display: "block", marginTop: 8 }}>Titolo</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
        />

        <label style={{ display: "block", marginTop: 8 }}>Store</label>
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
        >
          <option>Steam</option>
          <option>Epic</option>
          <option>GOG</option>
          <option>Humble</option>
          <option>Prime</option>
        </select>

        <label style={{ display: "block", marginTop: 8 }}>Tipo</label>
        <select
          value={dealType}
          onChange={(e) => setDealType(e.target.value as any)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
        >
          <option value="free">Gratis</option>
          <option value="discount">Sconto</option>
        </select>

        {dealType === "discount" && (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <input
              value={priceOld}
              onChange={(e) => setPriceOld(e.target.value)}
              placeholder="Prezzo vecchio"
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #444" }}
            />
            <input
              value={priceNew}
              onChange={(e) => setPriceNew(e.target.value)}
              placeholder="Prezzo nuovo"
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #444" }}
            />
          </div>
        )}

        <label style={{ display: "block", marginTop: 8 }}>URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
        />

        <label style={{ display: "block", marginTop: 8 }}>Scadenza (opzionale)</label>
        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
        />

        <button
          onClick={addDeal}
          disabled={loading}
          style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
        >
          {loading ? "Salvataggio..." : "Aggiungi offerta"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={loadList}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
          >
            Ricarica lista
          </button>

          <button
            onClick={deleteMany}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
          >
            Elimina prime 20
          </button>
        </div>

        <h2 style={{ marginTop: 14 }}>Ultime offerte (max 50)</h2>
        {list.length === 0 ? (
          <p style={{ opacity: 0.8 }}>Nessuna offerta salvata.</p>
        ) : (
          <ul>
            {list.map((d) => (
              <li key={d.id} style={{ marginBottom: 8 }}>
                <b>{d.title}</b> — {d.store} — {d.deal_type}{" "}
                <button
                  onClick={() => deleteDeal(d.id)}
                  style={{ marginLeft: 10, padding: "4px 8px", borderRadius: 8, border: "1px solid #444", cursor: "pointer" }}
                >
                  Elimina
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}