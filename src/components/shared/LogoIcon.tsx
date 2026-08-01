'use client';

export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-[#E50914] flex items-center justify-center text-white font-black shadow-md transition-transform hover:scale-105 ${className}`}>
      <span className="tracking-tighter font-serif italic text-white text-lg leading-none" style={{ fontFamily: 'Georgia, serif' }}>Z</span>
    </div>
  );
}
