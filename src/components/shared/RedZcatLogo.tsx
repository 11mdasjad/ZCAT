'use client';

export function RedZcatLogo({ className = "", height = 36 }: { className?: string; height?: number }) {
  return (
    <svg
      height={height}
      viewBox="0 0 540 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      role="img"
      aria-label="ZCAT Red Logo"
    >
      <g fill="#E50914">
        {/* Letter Z - Wavy Serif */}
        <path d="M 22 28 C 48 20, 95 20, 118 28 C 124 42, 110 52, 95 72 C 70 105, 42 135, 30 152 C 22 162, 38 162, 60 162 C 86 162, 112 155, 122 148 C 118 162, 102 172, 82 174 C 52 176, 18 176, 12 165 C 8 152, 22 135, 40 112 C 64 82, 90 50, 98 36 C 104 26, 86 28, 62 28 C 38 28, 24 34, 22 28 Z" />

        {/* Letter C - Bold Curved Counter */}
        <path d="M 188 24 C 142 22, 120 54, 120 98 C 120 144, 145 174, 192 172 C 212 171, 224 160, 228 148 C 212 154, 196 154, 184 152 C 154 148, 142 126, 142 98 C 142 60, 158 38, 184 38 C 196 38, 210 42, 224 48 C 220 34, 206 24, 188 24 Z" />

        {/* Letter A - Flared Taper Arch */}
        <path d="M 270 24 C 252 24, 242 36, 234 75 L 216 150 C 210 168, 204 174, 198 174 C 214 174, 230 168, 236 148 L 242 118 L 286 118 L 292 148 C 298 168, 312 174, 328 174 C 322 174, 316 165, 310 142 L 294 72 C 286 36, 280 24, 270 24 Z M 264 48 L 280 102 L 250 102 Z" />

        {/* Letter T - Flared Top Crossbar */}
        <path d="M 335 28 C 362 20, 422 20, 448 28 C 454 42, 438 48, 420 48 C 402 48, 400 62, 400 90 L 400 148 C 400 164, 414 168, 428 172 C 405 172, 376 172, 352 172 C 368 168, 380 164, 380 148 L 380 90 C 380 62, 378 48, 360 48 C 342 48, 328 42, 335 28 Z" />
      </g>
    </svg>
  );
}

export function RedZcatIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-[#E50914] flex items-center justify-center text-white font-black text-xl shadow-md ${className}`}>
      <span className="tracking-tighter font-serif italic text-white" style={{ fontFamily: 'Georgia, serif' }}>Z</span>
    </div>
  );
}
