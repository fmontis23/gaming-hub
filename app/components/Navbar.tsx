"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar">

      <div className="logo">
        🎮 Gaming Hub
      </div>

      <div className="menu">
        <Link href="/">Home</Link>
        <Link href="/deals">Offerte</Link>
        <Link href="/events">Eventi</Link>
        <Link href="/admin">Tornei</Link>
      </div>

      <div className="right">
        <Link className="login-btn" href="/profile">
          Profilo
        </Link>
      </div>

    </div>
  );
}