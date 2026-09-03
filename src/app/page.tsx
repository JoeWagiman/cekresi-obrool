"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSection } from "@/components/TrackingSection";
import { ShippingRateSection } from "@/components/ShippingRateSection";
import { AiChatSection } from "@/components/AiChatSection";
import { Search, Calculator, Radio } from "lucide-react";

export default function Home() {
  const [activeTool, setActiveTool] = useState<"track" | "cost">("track");
  const [mobileTab, setMobileTab] = useState<"tools" | "chat">("tools");

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F0] text-black font-mono selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Giant Monospace Terminal Hero Header */}
        <div className="border-b-2 border-black pb-6 mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-600">
            <span className="bg-black text-white px-2 py-0.5 tracking-widest text-[11px]">
              TERMINAL // 01
            </span>
            <span>DOMESTIC FREIGHT & WAYBILL VERIFICATION</span>
            <span className="text-zinc-400 font-normal">// [REVISION 2026]</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black uppercase leading-[1.05]">
            CEK RESI & ONGKIR EKSPEDISI
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-zinc-600 font-bold">
            <p className="max-w-2xl text-zinc-700">
              INSTRUMEN RESMI PELACAKAN RESI & KALKULASI TARIF MULTI-KURIR NASIONAL.
            </p>

            {/* Mobile Switcher */}
            <div className="flex lg:hidden border-2 border-black bg-white p-1 gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMobileTab("tools")}
                className={`px-3 py-1 text-xs font-black uppercase ${
                  mobileTab === "tools" ? "bg-black text-white" : "text-zinc-700"
                }`}
              >
                [01] MANIFEST
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("chat")}
                className={`px-3 py-1 text-xs font-black uppercase ${
                  mobileTab === "chat" ? "bg-black text-white" : "text-zinc-700"
                }`}
              >
                [02] SARAH TELEGRAPH
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Physical Manifest Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Primary Manifest Engine */}
          <div
            className={`space-y-6 ${
              mobileTab === "tools" ? "block" : "hidden lg:block"
            } lg:col-span-7 xl:col-span-7`}
          >
            {/* Tactile Hardware-Style Mode Switchers */}
            <div className="flex border-2 border-black bg-white p-1 gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <button
                type="button"
                onClick={() => setActiveTool("track")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTool === "track"
                    ? "bg-black text-white shadow-xs"
                    : "bg-transparent text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>[01] LACAK NOMOR RESI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("cost")}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTool === "cost"
                    ? "bg-black text-white shadow-xs"
                    : "bg-transparent text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>[02] SIMULASI TARIF ONGKIR</span>
              </button>
            </div>

            {/* Active Content Terminal */}
            <div>
              {activeTool === "track" ? <TrackingSection /> : <ShippingRateSection />}
            </div>
          </div>

          {/* Right Column: Sarah Operator Teletype */}
          <div
            className={`space-y-3 ${
              mobileTab === "chat" ? "block" : "hidden lg:block"
            } lg:col-span-5 xl:col-span-5`}
          >
            <div className="flex items-center justify-between px-1 text-xs font-black uppercase">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-black" />
                <span>TELEGRAPH // OPERATOR SARAH</span>
              </div>
              <span className="text-[10px] text-zinc-500">[STANDBY // LIVE]</span>
            </div>

            <AiChatSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
