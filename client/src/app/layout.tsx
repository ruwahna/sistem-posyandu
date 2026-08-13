import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { FontSizeProvider } from "../contexts/FontSizeContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import HelmetClientProvider from "../components/HelmetClientProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PosyanduKita — Sistem Informasi Posyandu",
  description: "Digitalisasi Pencatatan Tumbuh Kembang Anak & Pelayanan Lansia Mandiri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full bg-canvas text-saas-dark dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
        <HelmetClientProvider>
          <ThemeProvider>
            <FontSizeProvider>
              <AuthProvider>{children}</AuthProvider>
            </FontSizeProvider>
          </ThemeProvider>
        </HelmetClientProvider>
      </body>
    </html>
  );
}
