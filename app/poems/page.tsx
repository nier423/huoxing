"use client";

import Navbar from "@/components/Navbar";

const poems = [
  {
    id: 1,
    title: "星火燎原",
    author: "肖艳琳",
    content: `勤劳的殷实,不同的边界
不脱离边际,像欣赏一首诗
细细品其中的卓绝,和满足期望的心感`,
  },
  {
    id: 2,
    title: "你正站在关口上",
    author: "写给这样的我",
    content: `你正站在关口上你正站在关口上
就像这篇文章一样
坚持没有让你更坚定
反而变得更迷茫

新的还看不清，抓不到
旧的已经你慢慢扔掉
你正站在关口上

未知的前路有希望有吸引，也有险滩埋藏
过往的习惯有温暖有安全，也有锁链将你捆绑
取得的成绩是挥霍的筹码
还是新生的萌芽
在你理智和情感的撕扯间
左右摇晃
你正站在关口上

未来像随机抛出的硬币
在尘埃落定前无从窥藏
痛苦吗?要放弃吗?
要妥协了吗?
有答案了吗?
你正站在关口上
你已经站在了关口上`,
  },
  {
    id: 3,
    title: "變",
    author: "迟明",
    content: `老榕樹底下有位老人。
他抬起渾濁的雙眼，
望公園的鞦韆，
他的童年。

老榕樹底下有另一位老人。
她掀起前額的華髮，
看玩鬧的孩子們，
她的童年。

鞦韆上有一個男孩。
鐵索嘩啦啦地撞，
推木板的結實的手時高時低，
圓臉紅撲撲的，勝似夕陽。

公園裏有一個女孩。
鐵索吱呀呀地響，
晃盪的細瘦的腳時直時彎，
面頰高高鼓著，流轉霞光。`,
  },
];

export default function Poems() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-4xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            三行两句
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Poetry & Whispers
          </p>
        </div>

        {/* Poems List */}
        <div className="space-y-32">
          {poems.map((poem) => (
            <article key={poem.id} className="relative group">
              {/* Decorative line */}
              <div className="absolute -left-4 md:-left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D7CCC8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="text-center space-y-8">
                <h2 className="font-youyou text-3xl md:text-4xl text-[#3A3A3A] tracking-widest group-hover:text-[#A1887F] transition-colors duration-500">
                  {poem.title}
                </h2>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                  <span className="font-serif text-sm text-[#9E9E9E] tracking-widest">
                    {poem.author}
                  </span>
                  <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                </div>

                <div className="font-serif text-[#5D5D5D] text-lg leading-loose whitespace-pre-wrap">
                  {poem.content}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-32 text-center border-t border-[#D7CCC8]/30 pt-12">
          <p className="font-youyou text-[#A1887F] text-xl tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity cursor-default">
            诗歌是灵魂的呼吸
          </p>
        </div>
      </div>
    </main>
  );
}
