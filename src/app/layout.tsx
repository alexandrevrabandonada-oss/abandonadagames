import type { Metadata } from "next";
import { PwaBoot } from "@/components/pwa/PwaBoot";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.abandonadagames.online"),
  title: {
    default: "Abandonada Games",
    template: "%s | Abandonada Games",
  },
  description: "Plataforma mobile-first de mini-jogos curtos e compartilhaveis.",
  applicationName: "Abandonada Games",
  keywords: [
    "mini jogos",
    "jogos politicos",
    "jogos mobile",
    "abandonada games",
    "alexandre vr abandonada",
  ],
  openGraph: {
    title: "Abandonada Games",
    description: "Plataforma mobile-first de mini-jogos curtos e compartilhaveis.",
    url: "https://www.abandonadagames.online",
    siteName: "Abandonada Games",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/alexandre-vr.jpg",
        width: 1200,
        height: 1500,
        alt: "Alexandre VR Abandonada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abandonada Games",
    description: "Plataforma mobile-first de mini-jogos curtos e compartilhaveis.",
    images: ["/alexandre-vr.jpg"],
  },
};

export const viewport = {
  themeColor: "#f2a900",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <PwaBoot />
        {children}
      </body>
    </html>
  );
}
