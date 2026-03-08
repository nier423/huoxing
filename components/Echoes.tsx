"use client";

import { MessageSquareQuote, Send } from "lucide-react";
import Link from "next/link";

export default function Echoes() {
  const originalLetter = {
    id: "L1",
    author: "无名",
    date: "深秋",
    content: "有时候我觉得自己像是在水下呐喊。周遭寂静得震耳欲聋，喉咙却如火烧般灼痛。是否有人在听？听见我们内心最安静的角落？",
  };

  const echoes = [
    {
      id: "E1",
      author: "回响 #1",
      content: "水传播声音的方式不同。你的呐喊没有消失，它只是在不同的频率上传播。我们听得见。",
    },
    {
      id: "E2",
      author: "回响 #2",
      content: "我也曾经历过。试着让水托住你，而不是与它对抗。在深渊中，你并不孤单。",
    },
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-[#F0F4F8]/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D7CCC8] to-transparent opacity-50" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-youyou text-3xl md:text-4xl text-center mb-16 text-[#3A3A3A] tracking-widest flex items-center justify-center gap-3">
          <MessageSquareQuote className="w-6 h-6 text-[#A1887F]" />
          <span>见字如面</span>
        </h2>

        <div className="relative pl-8 md:pl-12 border-l border-[#D7CCC8]/50 space-y-16">
          {/* Original Letter */}
          <div className="relative -ml-8 md:-ml-12 group">
            <div className="absolute left-0 top-6 w-3 h-3 bg-[#A1887F] rounded-full border-4 border-[#F7F5F0] z-20 shadow-sm" />
            
            <div className="ml-8 md:ml-12 bg-white p-8 md:p-12 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm border border-[#EFEBE9] rotate-1 hover:rotate-0 transition-transform duration-500 ease-out origin-top-left relative overflow-hidden">
               {/* Paper Texture Overlay */}
               <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
               
              <div className="relative z-10">
                <div className="mb-8 flex justify-between items-end border-b border-[#D7CCC8]/30 pb-4">
                  <span className="text-xs text-[#9E9E9E] font-medium tracking-[0.2em] uppercase">信件 #L1</span>
                  <div className="text-right">
                     <div className="text-sm font-serif text-[#3A3A3A]">{originalLetter.author}</div>
                     <div className="text-xs text-[#9E9E9E] font-light mt-1">{originalLetter.date}</div>
                  </div>
                </div>
                
                <p className="font-serif text-xl md:text-2xl text-[#3A3A3A] leading-loose">
                  {originalLetter.content}
                </p>
                
                <div className="mt-8 pt-4 flex justify-end">
                   <button className="text-xs text-[#A1887F] hover:text-[#8D6E63] tracking-[0.15em] uppercase border-b border-[#A1887F]/30 hover:border-[#A1887F] transition-colors pb-1">
                     写下回响
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Echoes */}
          <div className="space-y-12">
            {echoes.map((echo, index) => (
              <div key={echo.id} className="relative group">
                <div className="absolute -left-[1px] top-8 w-2 h-2 bg-[#D7CCC8] rounded-full z-20" />
                
                <div 
                  className={`bg-[#FAF9F6] p-8 md:p-10 shadow-sm rounded-sm border-l-2 border-l-[#D7CCC8] hover:border-l-[#A1887F] hover:shadow-md transition-all duration-300 ${
                    index % 2 === 0 ? 'ml-6 md:ml-8' : 'ml-12 md:ml-16'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Send className="w-3 h-3 text-[#BCAAA4]" strokeWidth={1.5} />
                      <span className="text-[10px] tracking-[0.2em] text-[#9E9E9E] uppercase">来自 {echo.author} 的回响</span>
                    </div>
                    
                    <p className="font-light text-[#5D5D5D] text-lg leading-relaxed font-serif">
                      {echo.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
             <Link href="/letters" className="inline-block px-8 py-3 border border-[#D7CCC8] text-[#757575] hover:text-[#3A3A3A] hover:border-[#A1887F] hover:bg-white transition-all duration-300 rounded-sm text-sm tracking-[0.2em] uppercase">
               查看所有信件
             </Link>
        </div>
      </div>
    </section>
  );
}
