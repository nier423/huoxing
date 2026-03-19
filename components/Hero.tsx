"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  coverImage?: string | null;
}

export default function Hero({ coverImage }: HeroProps) {
  const posterSrc = coverImage || "/poster.jpg";

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 md:px-8 lg:px-12 xl:px-24 text-center lg:text-left bg-[#F7F5F0] overflow-hidden pb-16 lg:pb-0 pt-20 lg:pt-0">
      {/* Background Texture */}
      <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center mt-8 lg:mt-0 text-[#2C2C2C]">
        
        {/* Left: Typography */}
        <div className="flex flex-col justify-center w-full mx-auto max-w-xl lg:max-w-max lg:ml-auto lg:pr-4 xl:pr-8 transform lg:translate-x-8 xl:translate-x-12 z-20">
          <h1 className="font-liuye text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[7rem] leading-[1.15] opacity-95 tracking-tight text-center lg:text-left">
            <span className="inline-block whitespace-nowrap">让女性书写女性</span>
            <br />
            <span className="inline-block mt-4 md:mt-6 text-[#5D5D5D] opacity-80 text-3xl sm:text-4xl md:text-6xl lg:text-[4.5rem] xl:text-[6rem] whitespace-nowrap">
              让女性讲述女性
            </span>
          </h1>
          
          <div className="mt-12 lg:mt-16 border-t-2 lg:border-t-0 lg:border-l-2 border-[#D7CCC8] pt-6 lg:pt-0 lg:pl-8 opacity-0 animate-fade-in-up delay-[400ms]">
            <p className="font-youyou text-xl md:text-2xl text-[#757575] tracking-[0.25em] leading-relaxed text-center lg:text-left">
              星星之火，可以燎原
            </p>
            <p className="font-sans text-xs md:text-sm text-[#9E9E9E] mt-4 tracking-widest font-light uppercase text-center lg:text-left">
              Spark | Women's Writing Community
            </p>
          </div>
        </div>

        {/* Right: The Poster Card */}
        <div className="flex flex-col justify-center items-center w-full opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] mx-auto z-10 h-full mt-12 lg:mt-20">
          <div className="relative w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[340px] xl:max-w-[360px]">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#A1887F]/15 via-[#C83E4D]/5 to-transparent rounded-full blur-[60px] scale-[1.3] -z-10" />
            
            {/* Image Wrapper - Physical Poster Effect */}
            <div className="relative w-full rounded-sm bg-[#FDFCFB] p-2 md:p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] transform rotate-[4deg] transition-transform duration-700 hover:rotate-[1deg] hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] ring-1 ring-[#D7CCC8]/30">
              
              {/* Top Masking Tape */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-7 bg-[#EBE9E1]/90 shadow-sm rotate-[-6deg] z-20 border border-black/5 backdrop-blur-sm" />
              
              {/* Bottom Right Masking Tape */}
              <div className="absolute -bottom-3 -right-3 w-14 h-6 bg-[#EBE9E1]/90 shadow-sm rotate-[-40deg] z-20 border border-black/5 backdrop-blur-sm" />

              <div className="relative w-full rounded-[2px] overflow-hidden bg-[#F7F5F0]">
                <Image 
                  src={posterSrc}
                  alt="星火好看 当期封面"
                  width={800}
                  height={1131}
                  className="w-full h-auto block"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-[fadeInUp_0.8s_ease-out_1s_forwards] hidden lg:block">
        <ArrowDown className="w-5 h-5 md:w-6 md:h-6 text-[#A1887F] animate-[bounce_3s_infinite] opacity-60" strokeWidth={1.5} />
      </div>
    </section>
  );
}
