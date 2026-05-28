import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ThemeProvider from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SciWrite",
  description: "Scientific Writing Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
      >
        <ThemeProvider>
          <div className="flex">

            <Sidebar />

            <div className="flex-1">
              <Topbar />

              <main className="p-6">
                {children}
              </main>

            </div>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}