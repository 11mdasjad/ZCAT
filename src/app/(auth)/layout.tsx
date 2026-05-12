import ParticleBackground from '@/components/shared/ParticleBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#06080f]">
      <ParticleBackground />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
