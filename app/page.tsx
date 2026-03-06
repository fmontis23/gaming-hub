export default function HomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Gaming Hub</h1>
      <p>Sito online funzionante.</p>
      <div style={{ display: "flex", gap: 16 }}>
        <a href="/deals">Deals</a>
        <a href="/events">Eventi</a>
        <a href="/profile">Profilo</a>
      </div>
    </main>
  );
}