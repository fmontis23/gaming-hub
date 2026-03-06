"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-brand">
          <Link href="/" className="brand-link">
            <span className="brand-icon">🎮</span>
            <span className="brand-text">Gaming Hub</span>
          </Link>
        </div>

        <nav className="site-nav">
          <Link href="/">Home</Link>
          <Link href="/deals">Offerte</Link>
          <Link href="/events">Eventi</Link>
          <Link href="/admin">Tornei</Link>
        </nav>

        <div className="site-actions">
          <Link href="/profile" className="profile-button">
            Profilo
          </Link>
        </div>
      </div>
    </header>
  );
}