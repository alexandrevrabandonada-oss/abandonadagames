import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abandonada Games",
    short_name: "Abandonada",
    description: "Mini-jogos curtos, compartilhaveis e com critica social.",
    start_url: "/",
    display: "standalone",
    background_color: "#111311",
    theme_color: "#f2a900",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
