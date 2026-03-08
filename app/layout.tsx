import type { Metadata } from "next";
import { Playfair_Display, Lato, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["300", "400", "700"],
  subsets: ["latin"], // Note: preload only supports subsets, Chinese might not be fully preloaded but variable works
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "星火 Spark | 女性写作与共鸣社区",
  description: "一个安全的、纯女性的写作与共鸣社区。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${playfair.variable} ${lato.variable} ${notoSerifSC.variable} font-serif bg-[#F7F5F0] text-[#3A3A3A] paper-texture min-h-screen selection:bg-[#D7CCC8] selection:text-[#3A3A3A]`}>
        {children}
      </body>
    </html>
  );
}
