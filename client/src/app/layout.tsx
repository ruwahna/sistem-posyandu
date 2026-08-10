import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { FontSizeProvider } from "../contexts/FontSizeContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Informasi Posyandu",
  description: "Digitalisasi Pencatatan Tumbuh Kembang Anak & Pelayanan Lansia Mandiri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full bg-canvas text-saas-dark flex flex-col">
        <FontSizeProvider>
          <AuthProvider>{children}</AuthProvider>
        </FontSizeProvider>
      </body>
    </html>
  );
}
