import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Feed from "@/components/Feed";
import Echoes from "@/components/Echoes";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      {/* Add subtle fade-in animation to sections */}
      <div className="animate-fade-in">
        <Hero />
        
        <div className="relative z-10 -mt-12 md:-mt-24 rounded-t-3xl bg-white shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] pt-12">
          <Feed />
        </div>
      </div>

      <footer className="py-12 text-center text-[#9E9E9E] font-light text-sm tracking-widest border-t border-[#EFEBE9] bg-[#FAF9F6]">
        <p>&copy; 2026 星火. 拒绝凝视，点亮旷野。</p>
      </footer>
    </main>
  );
}
