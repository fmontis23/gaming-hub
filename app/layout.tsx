import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";

export const metadata: Metadata = {
  title: "Gaming Hub",
  description: "Offerte, free games e tornei della community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>

        {/* Navbar */}
        <div className="nav">
          <Navbar />
        </div>

        {/* Tasto indietro */}
        <div
          style={{
            width: "min(1180px, calc(100% - 32px))",
            margin: "0 auto",
            marginTop: 20
          }}
        >
          <BackButton />
        </div>

        {/* Contenuto pagine */}
        <div className="container">
          {children}
        </div>

      </body>
    </html>
  );
}