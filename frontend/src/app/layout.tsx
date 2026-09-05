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
  title: "CodeMasters - Tactical Espionage Action",
  description: "A fast-paced multiplayer word association game.",
  themeColor: "black",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden selection:bg-rose-500/30 bg-black bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.2),transparent_40%),linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_100%,100%_100%,100%_4px] bg-fixed">{children}</body>
    </html>
  );
}
