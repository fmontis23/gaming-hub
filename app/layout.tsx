import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";

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
        <div className="nav">
          <Navbar />
        </div>

        <div className="container">{children}</div>
      </body>
    </html>
  );
}