import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const liuYe = localFont({
  src: "../public/fonts/liuye.ttf",
  variable: "--font-liuye-local",
  display: "swap",
});

const youYou = localFont({
  src: "../public/fonts/youyou.ttf",
  variable: "--font-youyou-local",
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
      <body className={`${liuYe.variable} ${youYou.variable} font-serif bg-[#F7F5F0] text-[#3A3A3A] paper-texture min-h-screen selection:bg-[#D7CCC8] selection:text-[#3A3A3A]`}>
        {children}
      </body>
    </html>
  );
}
