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
  "Sistem untuk mengelola kontak, WhatsApp blast, inbox, CRM, follow-up, tagihan, dan laporan operasional.";

export const metadata: Metadata = {
  metadataBase: new URL("https://scraper.hellens.dev"),
  title: "Hellens Scraper",
  description: DESCRIPTION,
  openGraph: {
    title: "Hellens Scraper",
    description: DESCRIPTION,
    url: "https://scraper.hellens.dev",
    siteName: "Hellens",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hellens Scraper",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E4FF00",
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
