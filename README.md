# CekResi.id — Portal Cek Resi & Ongkir Ekspedisi

Web app modern dan cepat untuk melacak nomor resi kiriman dan menghitung tarif ongkos kirim resmi multi-ekspedisi Indonesia (JNE, J&T, SiCepat, POS, Anteraja, Wahana, TIKI, dll.), ditenagai oleh **AI CS Ekspedisi Obrool**.

## Fitur Utama
- **Lacak Resi Visual**: Linimasa status perjalanan paket secara realtime step-by-step.
- **Kalkulator Ongkir Akurat**: Pengecekan ongkir dari berbagai kurir diurutkan dari tarif paling hemat.
- **Asisten AI Logistik**: Chatbot cerdas yang paham bahasa santai, slang, singkatan daerah, dan typo wilayah.
- **Corong Pertumbuhan SaaS (Lead Magnet)**: Mengonversi pemilik toko online menjadi pengguna Obrool.com.

## Teknologi
- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **Obrool AI Backend & Binderbyte Gateway**

## Deploy ke Vercel
1. Import repositori ini ke Vercel.
2. Tambahkan domain: `cekresi.obrool.com`.
3. Tambahkan Environment Variable:
   - `NEXT_PUBLIC_OBROOL_API_URL=https://obrool.com`
   - `NEXT_PUBLIC_AGENT_ID=cmtloaz4p0001ob70a96jvol3`
   - `BINDERBYTE_API_KEY=c3ce564998ee62ea46fb1f00889cbf4ca8c7752e50c406ee3778508a5ba037bf`
