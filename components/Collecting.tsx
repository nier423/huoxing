"use client";

import Navbar from "@/components/Navbar";
import { PenLine } from "lucide-react";
import Link from "next/link";

export default function Collecting() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in pt-32 md:pt-40">
        <div className="max-w-md text-center space-y-8 md:space-y-12">
          {/* Decorative Circle */}
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-[#EFEBE9] rounded-full flex items-center justify-center mb-6 md:mb-8 relative mt-12 md:mt-0">
            <div className="absolute inset-0 border border-[#D7CCC8] rounded-full scale-110 opacity-50" />
            <PenLine className="w-8 h-8 md:w-10 md:h-10 text-[#A1887F] opacity-80" strokeWidth={1} />
          </div>

          <h1 className="font-youyou text-3xl md:text-4xl lg:text-5xl text-[#3A3A3A] tracking-[0.2em] leading-relaxed">
            正在收稿中
          </h1>
          
          <div className="space-y-4 md:space-y-6">
            <p className="font-serif text-[#757575] text-base md:text-lg leading-loose tracking-wide">
              这里还是一片空白<br />
              等待着第一个声音的到来
            </p>
            
            <div className="w-12 h-[1px] bg-[#D7CCC8] mx-auto opacity-60" />
            
            <p className="font-serif text-[#9E9E9E] text-xs md:text-sm italic tracking-widest">
              Be the first spark.
            </p>
          </div>

          <div className="pt-6 md:pt-8 pb-12 md:pb-0">
            <Link 
              href="/contact" 
              className="inline-block px-8 py-2.5 md:px-10 md:py-3 border border-[#D7CCC8] text-[#5D5D5D] hover:text-[#3A3A3A] hover:border-[#A1887F] hover:bg-white transition-all duration-500 rounded-sm text-xs md:text-sm tracking-[0.2em] font-youyou"
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
