"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">

        {/* BRAND */}
        <div className="site-brand">
          <Link href="/" className="brand-link">
            <span className="brand-icon">🎮</span>
            <span className="brand-text">Gaming Hub</span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="site-nav">
          <Link href="/">Home</Link>
          <Link href="/events">Eventi</Link>
          <Link href="/deals">Deals</Link>
          <Link href="/community">Community</Link>
        </nav>

        {/* ACTIONS */}
        <div className="site-actions">

          <a
            href="https://discord.gg/4NrqDfgP"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-button"
          >
            Discord
          </a>

          <Link href="/profile" className="profile-button">
            Profilo
          </Link>

        </div>

      </div>
    </header>
  );
}