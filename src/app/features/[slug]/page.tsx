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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-[#2563eb]/20">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div 
            className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
            style={{ backgroundColor: feature.color }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          
          {/* Back Navigation */}
          <Link 
            href="/#features" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4 text-[#2563eb]" />
            Back to Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left: Content Hero */}
            <div>
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-md`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] mb-6 leading-tight tracking-tight">
                {feature.title}
              </h1>
              
              <p className="text-xl text-[#64748b] font-medium mb-12 leading-relaxed">
                {feature.description}
              </p>

              <div className="prose prose-slate prose-p:text-[#64748b] prose-p:leading-loose max-w-none text-[#64748b] font-medium">
                <p>{feature.fullDescription}</p>
              </div>

              {/* How it Works Section */}
              <div className="mt-12 space-y-8">
                <h3 className="text-2xl font-bold text-[#0f172a] mb-6">How it Works</h3>
                <div className="space-y-6">
                  {feature.howItWorks.map((item, index) => (
                    <div key={index} className="relative pl-8 border-l-2 border-[#e2e8f0]">
                      <div 
                        className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: feature.color }}
                      />
                      <h4 className="text-lg font-bold text-[#0f172a] mb-2">{item.title}</h4>
                      <p className="text-[#64748b] font-medium leading-relaxed text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="btn-neon btn-neon-primary text-center flex items-center justify-center gap-2 font-bold shadow-md"
                >
                  Get Started for Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/contact" 
                  className="btn-neon btn-neon-secondary text-center font-bold"
                >
                  Request a Demo
                </Link>
              </div>
            </div>

            {/* Right: Key Benefits Grid */}
            <div className="space-y-6 lg:mt-12">
              <h3 className="text-xl font-bold text-[#0f172a] mb-8 border-b border-[#e2e8f0] pb-4">
                Key Benefits & Capabilities
              </h3>
              
              <div className="grid gap-4">
                {feature.keyBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="glass-card p-6 rounded-2xl border border-[#e2e8f0] bg-white shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
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
                        <h4 className="text-[#0f172a] font-bold mb-1.5">{benefit.title}</h4>
                        <p className="text-sm text-[#64748b] font-medium leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trust Badge */}
              <div className="mt-12 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-4">
                <Shield className="w-8 h-8 text-[#2563eb] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a]">Enterprise Grade Security</h4>
                  <p className="text-xs text-[#64748b] font-medium mt-1">SOC 2 Type II Certified and GDPR Compliant.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
