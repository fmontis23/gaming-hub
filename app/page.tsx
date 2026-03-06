"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Deal = {
  id: string;
  title: string;
  store: string;
  deal_type: string;
  url: string;
};

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  registrations_open: boolean;
};

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: dealsData } = await supabase
        .from("deals")
        .select("id,title,store,deal_type,url")
        .order("created_at", { ascending: false })
        .limit(6);

      const { data: eventsData } = await supabase
        .from("events")
        .select("id,title,event_date,registrations_open")
        .order("event_date", { ascending: true })
        .limit(6);

      setDeals((dealsData as Deal[]) ?? []);
      setEvents((eventsData as EventRow[]) ?? []);
    };

    loadData();
  }, []);

  return (
    <main style={{ padding: "24px 0 40px" }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          minHeight: 420,
          backgroundImage:
            "linear-gradient(90deg, rgba(6,10,18,0.92) 0%, rgba(6,10,18,0.68) 45%, rgba(6,10,18,0.85) 100%), url('/hero-gaming.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ padding: 32, maxWidth: 720 }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(124,58,237,0.35)",
              background: "rgba(124,58,237,0.12)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            PC Gaming • Deals • Eventi • Community
          </div>

          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 68px)",
              lineHeight: 1,
              margin: "18px 0 14px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
            }}
          >
            Gaming Hub
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              opacity: 0.88,
              maxWidth: 620,
              marginBottom: 24,
            }}
          >
            Una piattaforma gaming inclusiva per trovare giochi gratis, offerte PC,
            eventi community e tornei. Entra, completa il profilo e unisciti alla scena.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/deals"
              style={heroButtonPrimary()}
            >
              🎁 Scopri i deals
            </a>

            <a
              href="/events"
              style={heroButtonSecondary()}
            >
              🏆 Vai agli eventi
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        <a href="/deals" style={featureCard()}>
          <div style={imageBox("/card-deals.jpg")} />
          <div style={{ padding: 14 }}>
            <h3 style={{ margin: "0 0 8px" }}>💸 Offerte PC</h3>
            <p style={featureText()}>
              Steam, Epic, GOG e promozioni interessanti raccolte in un unico posto.
            </p>
          </div>
        </a>

        <a href="/events" style={featureCard()}>
          <div style={imageBox("/card-events.jpg")} />
          <div style={{ padding: 14 }}>
            <h3 style={{ margin: "0 0 8px" }}>🎮 Eventi & Tornei</h3>
            <p style={featureText()}>
              Eventi community, iscrizioni, squadre automatiche e annunci Discord.
            </p>
          </div>
        </a>

        <a href="/profile" style={featureCard()}>
          <div style={imageBox("/card-profile.jpg")} />
          <div style={{ padding: 14 }}>
            <h3 style={{ margin: "0 0 8px" }}>👤 Profilo Player</h3>
            <p style={featureText()}>
              Collega Discord, completa il profilo gaming e sblocca tutte le funzioni.
            </p>
          </div>
        </a>
      </section>

      <section
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        <div style={panelCard()}>
          <div style={panelHeader()}>
            <h2 style={{ margin: 0 }}>🔥 Ultimi deals</h2>
            <a href="/deals" style={smallLink()}>
              Vedi tutti
            </a>
          </div>

          {deals.length === 0 ? (
            <p style={{ opacity: 0.72 }}>Nessuna offerta ancora disponibile.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {deals.map((deal) => (
                <a
                  key={deal.id}
                  href={deal.url}
                  target="_blank"
                  rel="noreferrer"
                  style={listItem()}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{deal.title}</div>
                    <div style={{ opacity: 0.72, fontSize: 14 }}>
                      {deal.store} • {deal.deal_type === "free" ? "Gratis" : "Sconto"}
                    </div>
                  </div>
                  <span style={badgePurple()}>
                    {deal.deal_type === "free" ? "FREE" : "DEAL"}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={panelCard()}>
          <div style={panelHeader()}>
            <h2 style={{ margin: 0 }}>🏆 Prossimi eventi</h2>
            <a href="/events" style={smallLink()}>
              Vedi tutti
            </a>
          </div>

          {events.length === 0 ? (
            <p style={{ opacity: 0.72 }}>Nessun evento programmato.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {events.map((event) => (
                <div key={event.id} style={listItemStatic()}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{event.title}</div>
                    <div style={{ opacity: 0.72, fontSize: 14 }}>
                      {new Date(event.event_date).toLocaleString()}
                    </div>
                  </div>
                  <span style={event.registrations_open ? badgeGreen() : badgeYellow()}>
                    {event.registrations_open ? "APERTE" : "CHIUSE"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function heroButtonPrimary(): React.CSSProperties {
  return {
    padding: "12px 18px",
    borderRadius: 14,
    textDecoration: "none",
    color: "#fff",
    fontWeight: 700,
    border: "1px solid rgba(124,58,237,0.40)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.28), rgba(59,130,246,0.18))",
    backdropFilter: "blur(8px)",
  };
}

function heroButtonSecondary(): React.CSSProperties {
  return {
    padding: "12px 18px",
    borderRadius: 14,
    textDecoration: "none",
    color: "#fff",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(8px)",
  };
}

function featureCard(): React.CSSProperties {
  return {
    textDecoration: "none",
    color: "inherit",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
  };
}

function imageBox(src: string): React.CSSProperties {
  return {
    height: 180,
    backgroundImage: `linear-gradient(180deg, rgba(7,10,18,0.18), rgba(7,10,18,0.78)), url('${src}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

function featureText(): React.CSSProperties {
  return {
    margin: 0,
    opacity: 0.78,
    lineHeight: 1.55,
  };
}

function panelCard(): React.CSSProperties {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
  };
}

function panelHeader(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  };
}

function smallLink(): React.CSSProperties {
  return {
    color: "#c4b5fd",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  };
}

function listItem(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
    textDecoration: "none",
    color: "inherit",
  };
}

function listItemStatic(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  };
}

function badgePurple(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    background: "rgba(124,58,237,0.16)",
    border: "1px solid rgba(124,58,237,0.35)",
  };
}

function badgeGreen(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    background: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.35)",
  };
}

function badgeYellow(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    background: "rgba(245,158,11,0.16)",
    border: "1px solid rgba(245,158,11,0.35)",
  };
}