import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F7F5F0",
  colorScheme: "light",
};

const liuYe = localFont({
  src: "../public/fonts/liuye.woff2",
  variable: "--font-liuye-local",
  display: "swap",
});

const youYou = localFont({
  src: "../public/fonts/youyou.woff2",
  variable: "--font-youyou-local",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  applicationName: "星火 Spark",
  title: "星火 Spark | 女性写作与共鸣社区",
  description: "一个安全的、纯女性的写作与共鸣社区。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "星火",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/icons/icon-192.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${liuYe.variable} ${youYou.variable} font-serif bg-[#F7F5F0] text-[#3A3A3A] paper-texture min-h-screen selection:bg-[#D7CCC8] selection:text-[#3A3A3A]`}>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
