import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://sohanmirylkar.github.io/flowmetric-analytics-automation/"),
  title: "Flowmetric | Analytics Workflow Automation",
  description: "Ingest, validate, clean, and transform structured business data into decision-ready metrics.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Flowmetric | Analytics Workflow Automation",
    description: "Turn raw business records into validated, decision-ready metrics.",
    images: [{ url: "og.png", width: 1664, height: 954, alt: "Flowmetric analytics workflow automation dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowmetric | Analytics Workflow Automation",
    description: "Turn raw business records into validated, decision-ready metrics.",
    images: ["og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
