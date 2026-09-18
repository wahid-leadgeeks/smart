import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "LeadGeeks Inc. — 2026 IT SMART Goals & Strategic Plans",
  description: "Executive Studio web platform for tracking, reviewing, and executing LeadGeeks Inc. IT SMART goals, roadmaps, and monthly cadences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col font-sans bg-[#FBFBF9] text-[#1C1917] antialiased">
        {children}
      </body>
    </html>
  );
}
