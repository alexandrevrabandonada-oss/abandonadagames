import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaBoot } from "@/components/pwa/PwaBoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abandonada Games",
  description: "Plataforma mobile-first de mini-jogos curtos e compartilhaveis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <PwaBoot />
        {children}
      </body>
    </html>
  );
}
