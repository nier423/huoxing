import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "关于我们 | 星火",
  description: "了解星火的品牌缘起、视觉理念与联络方式。",
};

const originParagraphs = [
  "许多女性的文字，藏在日记里、备忘录里与聊天框里，她们和它们需要被看见。",
  "若现实中没有房间，便先点燃一束火。",
  "于是，《星火好看》诞生了。",
];

const ideals = [
  {
    title: "星（紫）",
    description: "象征女性的智慧、独立与温柔。它是暗夜微光，微小却真实，代表每一个“她”的力量。",
    color: "bg-[#9A74B6]"
  },
  {
    title: "火（红）",
    description: "象征热情、觉醒与联结。星光汇聚成火焰，温暖彼此，是社群的温度。",
    color: "bg-[#D39C78]"
  },
  {
    title: "线条",
    description: "延续女书的曲线与纤细笔意，保留流动呼吸感，让设计承载文化回声。",
    color: "bg-[#8A7A73]"
  },
  {
    title: "星落为火",
    description: "Logo 中“点”的设计，讲述星碎成火的过程。天际是星，人间是火，微光交织便有破晓的力量。",
    color: "bg-[#CFAF9D]"
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#2F2A27] font-sans selection:bg-[#CFAF9D]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Animated breathing background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(153,96,189,0.06)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '6s' }} />
           <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(199,93,58,0.05)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
            
            <div className="space-y-12">
              <div className="space-y-6 border-b border-[#E3D8D0]/60 pb-12">
                <div className="overflow-hidden">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#9C7D71] opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] font-medium">
                    About Xing Huo
                  </p>
                </div>
                
                <h1 className="font-liuye text-6xl leading-[1.1] text-[#26211E] md:text-[6.5rem] lg:text-[7.5rem] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] tracking-tight">
                  <span className="block">关于</span>
                  <span className="block text-[#5D5D5D] ml-8 lg:ml-16">我们</span>
                </h1>

                <p className="max-w-xl font-serif text-xl leading-loose text-[#5A504A] md:text-2xl opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
                  若现实中没有房间，便先点燃一束火。星火从女性写作出发，想为那些尚未被充分看见的表达，留出一个可以彼此照亮的位置。
                </p>
              </div>

              <blockquote className="max-w-2xl border-l-[3px] border-[#CFAF9D]/50 pl-8 font-serif text-xl leading-relaxed text-[#5A504A] md:text-[1.75rem] italic opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] relative group">
                <span className="absolute -left-6 -top-6 text-[5rem] text-[#CFAF9D]/20 font-serif leading-none group-hover:text-[#CFAF9D]/40 transition-colors duration-500">“</span>
                每一位微小的“她”在这里相遇、靠近。当一束微光遇见另一束微光，便拥有了破晓的力量。
              </blockquote>
            </div>

            <figure className="relative mx-auto w-full max-w-[480px] pt-8 lg:pt-0 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards] group perspective-1000">
              {/* Backlight glow */}
              <div className="absolute inset-0 h-full w-full rounded-full bg-gradient-to-tr from-[#9A74B6]/15 to-[#D39C78]/15 blur-[80px] group-hover:blur-[100px] transition-all duration-700 scale-110" />
              
              <div className="relative transform transition-transform duration-700 ease-out group-hover:-translate-y-4 group-hover:scale-[1.03]">
                <Image
                  src="/xinghuologo_trans.png"
                  alt="星火 Logo"
                  width={800}
                  height={800}
                  priority
                  className="mx-auto h-auto w-full drop-shadow-[6px_14px_16px_rgba(50,20,80,0.3)] transition-all duration-700"
                />
              </div>

              <figcaption className="mt-12 flex flex-col items-center justify-center border-t border-[#E5DCD5]/60 pt-6 text-xs uppercase tracking-[0.4em] text-[#8A7A73] font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-500 gap-2">
                <span>XING HUO</span>
                <span className="font-serif tracking-[0.2em] relative text-[#CFAF9D]">星落为火</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Brand Origin Section - Staggered layout with huge typography */}
      <section className="px-6 md:px-12 lg:px-24 bg-white/30">
        <div className="mx-auto max-w-7xl border-t border-[#E3D8D0]/60 pt-20 pb-24">
          <div className="grid gap-16 lg:grid-cols-[300px_1fr] lg:items-start">
            <div className="space-y-4 lg:sticky lg:top-32 lg:z-10">
              <p className="text-xs uppercase tracking-[0.4em] text-[#9C7D71] font-medium">Brand Origin</p>
              <h2 className="font-liuye text-5xl text-[#26211E] md:text-[4rem] leading-none">品牌缘起</h2>
            </div>

            <div className="grid gap-16 md:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-8 font-serif text-lg leading-[2.2] text-[#4D4640] md:text-2xl group cursor-default">
                {originParagraphs.map((paragraph, i) => (
                  <p key={i} className="transition-all duration-500 sm:group-hover:text-[#26211E]/30 sm:hover:!text-[#26211E] sm:hover:translate-x-3">{paragraph}</p>
                ))}
              </div>

              <aside className="relative space-y-6 pt-10 xl:border-l xl:border-[#E3D8D0]/60 xl:pl-12 xl:pt-0">
                <div className="absolute top-0 right-0 sm:right-auto sm:-left-6 text-[#E3D8D0]/30 text-[10rem] font-serif leading-none select-none pointer-events-none -mt-4">”</div>
                <p className="relative z-10 font-youyou text-3xl md:text-[2.5rem] leading-relaxed text-[#37312D]">
                  女人要写作，<br />必须拥有自己的房间。
                </p>
                <div className="relative z-10 flex items-center gap-4 pt-4">
                  <div className="h-[1px] w-8 bg-[#CFAF9D]" />
                  <p className="font-serif text-sm tracking-[0.25em] text-[#CFAF9D] uppercase font-medium">
                    Virginia Woolf
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Identity Interactive List */}
      <section className="px-6 md:px-12 lg:px-24 bg-white/60 py-28 relative">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4 lg:sticky lg:top-32 lg:z-10 h-max">
              <p className="text-xs uppercase tracking-[0.4em] text-[#9C7D71] font-medium">Visual Identity</p>
              <h2 className="font-liuye text-5xl text-[#26211E] md:text-[4rem] leading-none">视觉与理念</h2>
            </div>

            <div>
              <p className="max-w-2xl font-serif text-xl leading-loose text-[#5E544D] md:text-2xl mb-16">
                星与火并置，不是装饰性的符号，而是我们理解女性表达、互相照亮与共同生长的一种方式。
              </p>

              <div className="group border-t border-[#E3D8D0]/60 divide-y divide-[#E3D8D0]/40">
                {ideals.map((item, index) => (
                  <article
                    key={item.title}
                    className="relative grid gap-6 py-10 md:grid-cols-[180px_1fr] md:gap-12 transition-all duration-500 hover:bg-[#FDFCF9] hover:px-6 sm:-mx-6 cursor-crosshair group/row"
                  >
                    {/* Hover vertical indicator line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#9C7D71] scale-y-0 origin-center group-hover/row:scale-y-100 transition-transform duration-500" />
                    
                    <div className="flex items-start gap-4">
                      <span className={`mt-2.5 h-2.5 w-2.5 rounded-full ${item.color} shadow-sm group-hover/row:scale-[2] transition-transform duration-500`} />
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-[#A58B7E] font-medium opacity-60 group-hover/row:opacity-100 transition-opacity">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 font-youyou text-[1.6rem] text-[#2D2825] group-hover/row:text-[#9C7D71] transition-colors duration-300">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="font-serif text-lg md:text-xl leading-loose text-[#4F4842] group-hover/row:text-[#26211E] transition-colors duration-300 sm:pr-8">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="px-6 md:px-12 lg:px-24 py-32 bg-[#26211E] text-[#F7F5F0]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-[#CFAF9D] font-medium opacity-80">Another Channel</p>
              <h2 className="font-liuye text-5xl md:text-[5rem] leading-none text-[#FDFCF9]">
                另一个通道
              </h2>
            </div>
            
            <p className="max-w-2xl font-serif text-lg leading-loose text-[#D3C8C1] md:text-xl opacity-80">
              商务合作、读者群、志愿者招募、任何建议和意见...如果你想从另一个入口靠近星火，可以直接写信给我们。
            </p>

            <div className="pt-12 flex flex-col items-center">
              <a
                href="mailto:superray6261@gmail.com"
                className="group relative inline-flex flex-col items-center pb-2 cursor-pointer"
              >
                <span className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] text-[#FDFCF9] tracking-wider transition-transform duration-500 group-hover:-translate-y-2">
                  superray6261@gmail.com
                </span>
                
                {/* Advanced Animated Underline */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#5A504A] overflow-hidden">
                  <div className="h-full w-full bg-[#CFAF9D] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-[600ms] ease-out" />
                </div>
              </a>
              <p className="mt-12 text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#8A7A73]">
                © 星火母狮邮箱
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
