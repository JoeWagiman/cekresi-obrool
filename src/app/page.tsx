"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSection } from "@/components/TrackingSection";
import { ShippingRateSection } from "@/components/ShippingRateSection";
import { AiChatSection } from "@/components/AiChatSection";
import { GrowthCta } from "@/components/GrowthCta";
import { Search, Calculator, Bot, ShieldCheck, Zap, Truck, HelpCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"track" | "cost" | "chat">("track");

  const faqs = [
    {
      q: "Berapa lama waktu update status resi pengiriman?",
      a: "Status pelacakan resi diperbarui secara realtime langsung dari server resmi masing-masing ekspedisi begitu paket discan di drop point atau hub transit kurir.",
    },
    {
      q: "Apakah tarif ongkir yang ditampilkan sudah resmi?",
      a: "Ya, seluruh estimasi tarif ongkir yang ditampilkan divalidasi langsung dari database tarif resmi kurir reguler, ekspres, dan kargo di seluruh Indonesia.",
    },
    {
      q: "Bagaimana cara memasang fitur bot cek resi ini di toko online saya?",
      a: "Anda dapat menggunakan layanan Obrool.com untuk memasang chatbot AI CS WhatsApp & Widget Webstore yang dapat mengecek resi dan menjawab pertanyaan pembeli secara otomatis 24 jam nonstop.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-semibold text-blue-700">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Lacak Resi & Cek Ongkir Resmi Multi-Ekspedisi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Cek Resi & Tarif Ongkir <span className="text-blue-600">Ekspedisi Tercepat</span>
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Lacak status kiriman dan hitung ongkos kirim JNE, J&T, SiCepat, POS, Anteraja & Wahana secara instan dengan dukungan AI Logistik cerdas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1.5 rounded-2xl border border-zinc-200/80 shadow-sm inline-flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Lacak Resi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cost")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "cost"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Cek Ongkir</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Tanya Asisten AI</span>
              <span className="text-[0.625rem] px-1.5 py-0.2 bg-emerald-500 text-white font-bold rounded-full">
                Live
              </span>
            </button>
          </div>
        </div>

        {/* Active Tool Content */}
        <div className="transition-all duration-150">
          {activeTab === "track" && <TrackingSection />}
          {activeTab === "cost" && <ShippingRateSection />}
          {activeTab === "chat" && <AiChatSection />}
        </div>

        {/* Trust & Features Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Pengecekan Realtime</h4>
              <p className="text-[0.6875rem] text-zinc-500">Terhubung ke API resmi ekspedisi nasional</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">15+ Kurir Indonesia</h4>
              <p className="text-[0.6875rem] text-zinc-500">JNE, J&T, SiCepat, POS, TIKI, Wahana & Kargo</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Dukungan AI Cerdas</h4>
              <p className="text-[0.6875rem] text-zinc-500">Tanya ongkir santai tanpa bingung format</p>
            </div>
          </div>
        </div>

        {/* Growth CTA */}
        <GrowthCta />

        {/* FAQ Section */}
        <div className="mt-16 space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Pertanyaan yang Sering Diajukan</h3>
            <p className="text-xs text-zinc-500">Seputar pelacakan nomor resi dan perhitungan tarif pengiriman</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <h4 className="text-xs font-bold text-zinc-900">{f.q}</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
