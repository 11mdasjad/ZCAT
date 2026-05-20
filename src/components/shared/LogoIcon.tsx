export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zcat-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect 
        x="0" 
        y="0" 
        width="200" 
        height="200" 
        rx="24" 
        fill="#07091A" 
        stroke="url(#zcat-gradient)" 
        strokeWidth="6" 
      />
      <rect 
        x="8" 
        y="8" 
        width="184" 
        height="184" 
        rx="18" 
        fill="none" 
        stroke="url(#zcat-gradient)" 
        strokeWidth="1.5" 
        opacity="0.4" 
      />
      <text 
        x="100" 
        y="155" 
        fontFamily="monospace" 
        fontSize="160" 
        fontWeight="700" 
        fill="url(#zcat-gradient)" 
        textAnchor="middle"
      >
        Z
      </text>
    </svg>
  );
}
