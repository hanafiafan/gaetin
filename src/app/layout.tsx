import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const DESCRIPTION =
  "Temukan prospek Google Maps, cari email bisnis, kelola WhatsApp, kontak, pipeline CRM dan tindak lanjut tim dalam satu workspace.";

export const metadata: Metadata = {
  metadataBase: new URL("https://scraper.hellens.dev"),
  title: "Hellens — Prospek, WhatsApp & CRM",
  description: DESCRIPTION,
  openGraph: {
    title: "Hellens — Prospek, WhatsApp & CRM",
    description: DESCRIPTION,
    url: "https://scraper.hellens.dev",
    siteName: "Hellens",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hellens — Prospek, WhatsApp & CRM",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#191919",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
