"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, PenLine, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { name: "有话慢谈", href: "/slow-talk" },
    { name: "人间剧场", href: "/theater" },
    { name: "胡说八道", href: "/nonsense" },
    { name: "三行两句", href: "/poems" },
    { name: "见字如面", href: "/letters" },
  ];

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#F7F5F0]/80 backdrop-blur-sm border-b border-[#D7CCC8]/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="font-youyou text-2xl md:text-3xl tracking-widest text-[#3A3A3A] hover:opacity-80 transition-opacity">
            星火
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-[#5D5D5D] hover:text-[#3A3A3A] text-base lg:text-lg tracking-wide font-youyou group transition-colors duration-300"
            >
              {item.name}
              <span className="absolute -bottom-2 left-1/2 w-0 h-[1px] bg-[#A1887F] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
            </Link>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            href="/contact" 
            className="group flex items-center space-x-2 text-[#5D5D5D] hover:text-[#A1887F] transition-colors duration-300"
          >
            <PenLine className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
            <span className="text-xs md:text-sm font-youyou tracking-wide">联系我们</span>
          </Link>
          
          <Link 
            href="/login" 
            className="text-xs md:text-sm font-youyou text-[#5D5D5D] hover:text-[#3A3A3A] tracking-wide border border-[#D7CCC8] px-3 py-1 md:px-5 md:py-1.5 rounded-full hover:bg-[#EFEBE9] transition-all duration-300"
          >
            登录 / 加入
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
          aria-label={isMobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.75} /> : <Menu className="w-6 h-6" strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 top-20 bg-[#3A3A3A]/40"
          aria-label="关闭菜单遮罩"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="移动端导航菜单"
          className="md:hidden fixed top-20 right-0 h-[calc(100vh-5rem)] w-72 max-w-[85vw] bg-[#F7F5F0] border-l border-[#D7CCC8]/50 shadow-xl"
        >
          <div className="h-full overflow-y-auto p-6 flex flex-col">
            <div className="flex flex-col gap-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="text-lg font-youyou tracking-wide text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#D7CCC8]/50 flex flex-col gap-4">
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="group inline-flex items-center space-x-2 text-[#5D5D5D] hover:text-[#A1887F] transition-colors duration-300"
              >
                <PenLine className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-youyou tracking-wide">联系我们</span>
              </Link>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="inline-flex justify-center text-sm font-youyou text-[#5D5D5D] hover:text-[#3A3A3A] tracking-wide border border-[#D7CCC8] px-5 py-2 rounded-full hover:bg-[#EFEBE9] transition-all duration-300"
              >
                登录 / 加入
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
