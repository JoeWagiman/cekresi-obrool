"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSection } from "@/components/TrackingSection";
import { ShippingRateSection } from "@/components/ShippingRateSection";
import { AiChatSection } from "@/components/AiChatSection";
import { Search, Calculator, MessageSquare } from "lucide-react";

export default function Home() {
  const [activeTool, setActiveTool] = useState<"track" | "cost">("track");
  const [mobileTab, setMobileTab] = useState<"tools" | "chat">("tools");

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Large Editorial Hero Title */}
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-zinc-900 leading-[1.1]">
            Cek Resi & Tarif Ongkir
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl leading-relaxed">
            Lacak pergerakan paket dan periksa simulasi ongkos kirim berbagai kurir di seluruh Indonesia.
          </p>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden pt-2">
            <div className="bg-zinc-200/80 p-1 rounded-xl text-xs font-semibold inline-flex gap-1">
              <button
                type="button"
                onClick={() => setMobileTab("tools")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  mobileTab === "tools" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Pengecekan Manual
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("chat")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  mobileTab === "chat" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Tanya Sarah (CS)
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Wide-Screen Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Primary Tool */}
          <div
            className={`space-y-5 ${
              mobileTab === "tools" ? "block" : "hidden lg:block"
            } lg:col-span-7 xl:col-span-7`}
          >
            {/* Tool Switcher Pills */}
            <div className="inline-flex bg-zinc-200/70 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTool("track")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTool === "track"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Lacak Nomor Resi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("cost")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTool === "cost"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Simulasi Ongkir</span>
              </button>
            </div>

            {/* Active Content */}
            <div>
              {activeTool === "track" ? <TrackingSection /> : <ShippingRateSection />}
            </div>
          </div>

          {/* Right Column: Sarah CS Logistics Concierge */}
          <div
            className={`space-y-3 ${
              mobileTab === "chat" ? "block" : "hidden lg:block"
            } lg:col-span-5 xl:col-span-5`}
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <MessageSquare className="w-4 h-4 text-zinc-700" />
                <span>Konsultasi Pengiriman</span>
              </div>
              <span className="text-xs text-zinc-400">Tanya langsung via chat</span>
            </div>

            <AiChatSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
