"use client";

import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-8 text-center bg-[#F7F5F0]">
      {/* Background Texture */}
      <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        <h1 className="font-liuye text-5xl md:text-7xl lg:text-8xl leading-tight text-[#2C2C2C] opacity-95 tracking-wide">
          让女性书写女性<br />
          <span className="inline-block mt-4 md:mt-6 text-[#5D5D5D] opacity-80">让女性讲述女性</span>
        </h1>
        
        <p className="font-youyou text-lg md:text-2xl text-[#757575] tracking-[0.2em] mt-8 max-w-2xl mx-auto border-t border-[#D7CCC8] pt-8 opacity-0 animate-fade-in-up delay-300">
          星星之火，可以燎原
        </p>

        <div className="mt-24 flex justify-center opacity-0 animate-fade-in-up delay-700">
          <ArrowDown className="w-6 h-6 text-[#A1887F] animate-bounce-slow opacity-60" strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}
