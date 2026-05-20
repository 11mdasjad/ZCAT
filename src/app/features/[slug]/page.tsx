import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, Shield } from 'lucide-react';
import { featuresData } from '@/lib/data/features';
import Navbar from '@/components/shared/Navbar';

interface FeaturePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return featuresData.map((feature) => ({
    slug: feature.slug,
  }));
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const resolvedParams = await params;
  const feature = featuresData.find((f) => f.slug === resolvedParams.slug);

  if (!feature) {
    notFound();
  }

  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col selection:bg-[#00d4ff]/30">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div 
            className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 mix-blend-screen"
            style={{ backgroundColor: feature.color }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          
          {/* Back Navigation */}
          <Link 
            href="/#features" 
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left: Content Hero */}
            <div>
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-2xl`}
                style={{ boxShadow: `0 0 40px ${feature.color}40` }}
              >
                <Icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                {feature.title}
              </h1>
              
              <p className="text-xl text-[#8b949e] mb-12 leading-relaxed">
                {feature.description}
              </p>

              <div className="prose prose-invert prose-p:text-[#8b949e] prose-p:leading-loose max-w-none">
                <p>{feature.fullDescription}</p>
              </div>

              {/* How it Works Section */}
              <div className="mt-12 space-y-8">
                <h3 className="text-2xl font-semibold text-white mb-6">How it Works</h3>
                <div className="space-y-6">
                  {feature.howItWorks.map((item, index) => (
                    <div key={index} className="relative pl-8 border-l-2 border-[#21262d]">
                      <div 
                        className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: feature.color, boxShadow: `0 0 10px ${feature.color}` }}
                      />
                      <h4 className="text-lg font-medium text-white mb-2">{item.title}</h4>
                      <p className="text-[#8b949e] leading-relaxed text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="btn-neon text-white text-center flex items-center justify-center gap-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}40, transparent)`,
                    borderColor: `${feature.color}60`
                  }}
                >
                  Get Started for Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/contact" 
                  className="btn-neon btn-neon-secondary text-center"
                >
                  Request a Demo
                </Link>
              </div>
            </div>

            {/* Right: Key Benefits Grid */}
            <div className="space-y-6 lg:mt-12">
              <h3 className="text-xl font-semibold text-white mb-8 border-b border-[#21262d] pb-4">
                Key Benefits & Capabilities
              </h3>
              
              <div className="grid gap-4">
                {feature.keyBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="glass-card p-6 rounded-2xl hover:border-[#30363d] transition-colors relative overflow-hidden group"
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: feature.color }}
                    />
                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" style={{ color: feature.color }} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1.5">{benefit.title}</h4>
                        <p className="text-sm text-[#8b949e] leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trust Badge */}
              <div className="mt-12 p-6 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-center gap-4">
                <Shield className="w-8 h-8 text-[#00d4ff] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Enterprise Grade Security</h4>
                  <p className="text-xs text-[#8b949e] mt-1">SOC 2 Type II Certified and GDPR Compliant.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
