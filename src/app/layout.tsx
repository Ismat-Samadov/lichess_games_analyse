import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUDO NEON — Cyber Board Game",
  description: "A futuristic neon-themed Ludo board game with AI opponents, animations and sound effects.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#050510] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
