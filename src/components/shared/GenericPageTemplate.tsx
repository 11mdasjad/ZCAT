import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, Shield } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { FooterPageData } from '@/lib/data/footerPages';

interface GenericPageTemplateProps {
  pageData: FooterPageData;
}

export default function GenericPageTemplate({ pageData }: GenericPageTemplateProps) {
  const Icon = pageData.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-[#2563eb]/20">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div 
            className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
            style={{ backgroundColor: pageData.color }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          
          {/* Back Navigation */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left: Content Hero */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border border-[#e2e8f0] text-[#475569] bg-white shadow-sm">
                  {pageData.category}
                </span>
              </div>

              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pageData.gradient} flex items-center justify-center mb-8 shadow-xl`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] mb-6 leading-tight tracking-tight">
                {pageData.title}
              </h1>
              
              <p className="text-xl text-[#64748b] mb-12 leading-relaxed">
                {pageData.description}
              </p>

              <div className="prose prose-slate prose-p:text-[#64748b] prose-p:leading-loose max-w-none">
                <p>{pageData.fullDescription}</p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="btn-neon btn-neon-primary text-center flex items-center justify-center gap-2"
                >
                  Get Started for Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/contact" 
                  className="btn-neon btn-neon-secondary text-center"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* Right: Detailed Sections Grid */}
            <div className="space-y-6 lg:mt-12">
              <h3 className="text-xl font-semibold text-[#0f172a] mb-8 border-b border-[#e2e8f0] pb-4">
                Overview & Details
              </h3>
              
              <div className="grid gap-4">
                {pageData.sections.map((section, index) => (
                  <div 
                    key={index}
                    className="glass-card p-6 rounded-2xl transition-all relative overflow-hidden group"
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: pageData.color }}
                    />
                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" style={{ color: pageData.color }} />
                      </div>
                      <div>
                        <h4 className="text-[#0f172a] font-semibold mb-1.5">{section.title}</h4>
                        <p className="text-sm text-[#64748b] leading-relaxed">
                          {section.description}
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
                  <h4 className="text-sm font-semibold text-[#0f172a]">Trusted Globally</h4>
                  <p className="text-xs text-[#64748b] mt-1">Join 500+ companies using ZCAT.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
