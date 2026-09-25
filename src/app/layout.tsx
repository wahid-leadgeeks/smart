import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: "#1C1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "LeadGeeks Inc. — 2026 IT SMART Goals & Strategic Plans",
  description: "Executive Studio web platform for tracking, reviewing, and executing LeadGeeks Inc. IT SMART goals, roadmaps, and monthly cadences.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LeadGeeks IT",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="h-full flex flex-col font-sans bg-[#FBFBF9] text-[#1C1917] antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
