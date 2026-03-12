/**
 * Layout racine de l'application.
 * Fournit les polices, le thème dark, et le contexte global.
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suno Lyrics Studio",
  description: "Éditeur de paroles et générateur de prompts Suno AI",
  keywords: ["lyrics", "suno", "ai", "music", "chanson"],
  authors: [{ name: "Suno Lyrics Studio" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-studio-bg text-studio-text antialiased">
        {children}
      </body>
    </html>
  );
}
