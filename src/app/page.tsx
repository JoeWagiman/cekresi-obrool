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
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Title Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Cek Resi & Ongkos Kirim
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pelacakan nomor resi pengiriman dan simulasi tarif kurir domestik.
            </p>
          </div>

          {/* Mobile view switcher */}
          <div className="flex lg:hidden bg-zinc-200/70 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMobileTab("tools")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mobileTab === "tools" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Alat Ekspedisi
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mobileTab === "chat" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Asisten Chat
            </button>
          </div>
        </div>

        {/* 2-Column Wide-Screen Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Primary Tool Panel) */}
          <div
            className={`space-y-4 ${
              mobileTab === "tools" ? "block" : "hidden lg:block"
            } lg:col-span-7 xl:col-span-7`}
          >
            {/* Tool Segmented Switcher */}
            <div className="inline-flex bg-zinc-200/60 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTool("track")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === "track"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Resi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("cost")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === "cost"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Cek Tarif Ongkir</span>
              </button>
            </div>

            {/* Active Tool View */}
            <div className="transition-all duration-100">
              {activeTool === "track" ? <TrackingSection /> : <ShippingRateSection />}
            </div>
          </div>

          {/* Right Column (Side-by-Side Assistant on Wide Screens) */}
          <div
            className={`space-y-3 ${
              mobileTab === "chat" ? "block" : "hidden lg:block"
            } lg:col-span-5 xl:col-span-5`}
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span>Asisten Langsung</span>
              </div>
              <span className="text-[0.6875rem] text-zinc-400">Siap membantu cek rute & resi</span>
            </div>

            <AiChatSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
