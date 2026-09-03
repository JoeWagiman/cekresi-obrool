import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cek Resi & Ongkos Kirim — Obrool",
  description: "Lacak nomor resi kiriman dan periksa perkiraan tarif ongkir kurir di Indonesia.",
  keywords: [
    "Cek Resi",
    "Cek Ongkir",
    "Lacak Paket",
    "Tarif Kurir",
    "Obrool",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
