"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Gaming Hub</h1>

      <p>
        Community gaming con:
      </p>

      <ul>
        <li>💸 Giochi gratis</li>
        <li>🔥 Offerte Steam / Epic</li>
        <li>🏆 Eventi e tornei</li>
      </ul>

      <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
        <Link href="/deals">Offerte</Link>
        <Link href="/events">Eventi</Link>
        <Link href="/profile">Profilo</Link>
      </div>
    </main>
  );
}
