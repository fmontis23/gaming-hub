import "./globals.css";
import Navbar from "./components/Navbar";
import ClientProfileSync from "./components/ClientProfileSync";

export const metadata = {
  title: "Gaming Hub",
  description: "Community gaming con eventi, squadre e offerte sui giochi.",
  openGraph: {
    title: "Gaming Hub",
    description:
      "Partecipa agli eventi della community, trova giochi gratis e gioca con altri gamer.",
    url: "https://gamehubitalia.it",
    siteName: "Gaming Hub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <ClientProfileSync />

        <div className="nav">
          <Navbar />
        </div>

        <div className="container">{children}</div>
      </body>
    </html>
  );
}