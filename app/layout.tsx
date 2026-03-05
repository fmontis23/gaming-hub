import "./globals.css";

export const metadata: Metadata = {
  title: "Gaming Hub",
  description: "Offerte, free games e tornei della community",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <header
          style={{
            borderBottom: "1px solid #2b2b2b",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800 }}>
            🎮 Gaming Hub
          </a>

          <nav style={{ display: "flex", gap: 14 }}>
            <a href="/" style={{ color: "inherit" }}>Home</a>
            <a href="/deals" style={{ color: "inherit" }}>Offerte</a>
            <a href="/events" style={{ color: "inherit" }}>Eventi/Tornei</a>
            <a href="/profile" style={{ color: "inherit" }}>Profilo</a>
          </nav>
        </header>

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
<nav style={{
  display: "flex",
  gap: 20,
  padding: 16,
  borderBottom: "1px solid #333"
}}>
  <a href="/">Home</a>
  <a href="/deals">Deals</a>
  <a href="/events">Eventi</a>
  <a href="/profile">Profilo</a>
  <a href="/admin">Moderazione</a>
</nav>
import Navbar from "./components/Navbar";
