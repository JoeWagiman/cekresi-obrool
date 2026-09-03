import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cek Resi & Ongkir Ekspedisi Cepat Indonesia — CekResi.id",
  description:
    "Cek resi paket dan tarif ongkir resmi terlengkap dari JNE, J&T, SiCepat, POS Indonesia, Anteraja, Wahana, Lion Parcel secara realtime dengan dukungan AI CS Ekspedisi 24/7.",
  keywords: [
    "Cek Resi",
    "Cek Ongkir",
    "Lacak Paket",
    "Tarif JNE",
    "Tarif J&T",
    "Tarif SiCepat",
    "Tarif POS",
    "Ekspedisi Indonesia",
    "Bot Cek Resi",
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
