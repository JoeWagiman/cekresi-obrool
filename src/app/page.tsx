"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSection } from "@/components/TrackingSection";
import { ShippingRateSection } from "@/components/ShippingRateSection";
import { AiChatSection } from "@/components/AiChatSection";
import { Search, Calculator, MessageSquare } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"track" | "cost" | "chat">("track");

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Title */}
        <div className="mb-8 text-center sm:text-left space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Cek Resi & Ongkos Kirim
          </h1>
          <p className="text-sm text-zinc-500">
            Lacak kiriman paket atau periksa perkiraan tarif kurir domestik secara langsung.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-200 mb-6 gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              activeTab === "track"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Lacak Resi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cost")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              activeTab === "cost"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Cek Tarif</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              activeTab === "chat"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya Asisten AI</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "track" && <TrackingSection />}
          {activeTab === "cost" && <ShippingRateSection />}
          {activeTab === "chat" && <AiChatSection />}
        </div>

        {/* Subtle note */}
        <div className="mt-14 p-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            Data pelacakan dan tarif diperoleh melalui integrasi API kurir Binderbyte.
          </span>
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 font-medium hover:underline whitespace-nowrap"
          >
            Pasang bot ini di toko Anda &rarr;
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
