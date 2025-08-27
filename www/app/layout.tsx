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

const siteBase = "https://shivantra.com";
const basePath = "/react-web-camera";
const absolute = (p: string) => `${siteBase}${p}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteBase),
  title: "React Web Camera – Shivantra",
  description:
    "A lightweight React component to capture images from the browser camera. Switch front/back, control quality, and use it in PWAs.",
  keywords: [
    "react webcam",
    "react web camera",
    "react capture image",
    "react webcam component",
    "react camera front back",
    "pwa camera react",
    "react-web-camera",
  ],
  authors: [
    {
      name: "Shivantra Solutions Private Limited",
      url: "https://shivantra.com",
    },
  ],
  creator: "Shivantra",
  publisher: "Shivantra Solutions",
  alternates: {
    canonical: absolute(`${basePath}/`),
  },
  openGraph: {
    title: "React Web Camera – Shivantra",
    description:
      "Capture images directly from the browser in React apps. Lightweight, mobile-friendly, and supports front/back switching.",
    url: absolute(`${basePath}/`),
    siteName: "Shivantra React Web Camera",
    images: [
      {
        url: absolute(`${basePath}/og/preview.png`),
        width: 1200,
        height: 630,
        alt: "React Web Camera demo preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "React Web Camera – Shivantra",
    description:
      "React component to access the browser camera, capture images, and switch between cameras.",
    images: [absolute(`${basePath}/og/preview.png`)],
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
