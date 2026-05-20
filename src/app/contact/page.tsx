import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Mail, MessageSquare, Phone, Shield, Building2, Users } from 'lucide-react';

export default function ContactSalesPage() {
  return (
    <div className="min-h-screen bg-[#06080f] flex flex-col selection:bg-[#00d4ff]/30">
      <Navbar />

      <main className="flex-1 relative pt-32 pb-24">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00d4ff] rounded-full blur-[150px] opacity-10 mix-blend-screen" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[150px] opacity-10 mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Talk to our <span className="gradient-text">Sales Team</span>
            </h1>
            <p className="text-[#8b949e] text-lg sm:text-xl">
              Learn how ZCAT can help your engineering team scale hiring securely and effectively. 
              Fill out the form below and we'll be in touch shortly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            
            {/* Left: Contact Form */}
            <div className="glass-card p-8 sm:p-10 rounded-2xl relative overflow-hidden group">
              {/* Form glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <form className="space-y-6 relative z-10">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-[#8b949e]">First Name *</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="input-neon w-full bg-[#0d1117]/50" 
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-[#8b949e]">Last Name *</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="input-neon w-full bg-[#0d1117]/50" 
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[#8b949e]">Work Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="input-neon w-full bg-[#0d1117]/50" 
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium text-[#8b949e]">Company Name *</label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        type="text" 
                        id="company" 
                        className="input-neon w-full bg-[#0d1117]/50 pl-10" 
                        placeholder="Acme Corp"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="companySize" className="text-sm font-medium text-[#8b949e]">Company Size *</label>
                    <div className="relative">
                      <Users className="w-5 h-5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select 
                        id="companySize" 
                        className="input-neon w-full bg-[#0d1117]/50 pl-10 appearance-none cursor-pointer text-white"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled className="text-[#8b949e]">Select size...</option>
                        <option value="1-50" className="bg-[#0d1117] text-white">1-50 employees</option>
                        <option value="51-200" className="bg-[#0d1117] text-white">51-200 employees</option>
                        <option value="201-1000" className="bg-[#0d1117] text-white">201-1000 employees</option>
                        <option value="1000+" className="bg-[#0d1117] text-white">1000+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-[#8b949e]">How can we help? *</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="input-neon w-full bg-[#0d1117]/50 resize-none" 
                    placeholder="Tell us about your hiring goals, assessment volume, or specific features you're looking for..."
                    required
                  />
                </div>

                <button type="submit" className="btn-neon btn-neon-primary w-full py-3.5 text-base shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]">
                  Contact Sales Team
                </button>
                
                <p className="text-xs text-[#8b949e] text-center">
                  By submitting this form, you agree to our <a href="#" className="text-[#00d4ff] hover:underline">Privacy Policy</a> and <a href="#" className="text-[#00d4ff] hover:underline">Terms of Service</a>.
                </p>
              </form>
            </div>

            {/* Right: Info & Proof */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-white">What happens next?</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">We'll reach out</h4>
                      <p className="text-sm text-[#8b949e] leading-relaxed">
                        A product expert will contact you within 24 hours to discuss your specific needs and hiring goals.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#a855f7]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Book a custom demo</h4>
                      <p className="text-sm text-[#8b949e] leading-relaxed">
                        We'll walk you through a tailored demonstration of the platform focused on your tech stack and workflows.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Start your pilot</h4>
                      <p className="text-sm text-[#8b949e] leading-relaxed">
                        Get access to a fully-featured sandbox environment to test drive ZCAT with your engineering team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Direct */}
              <div className="pt-8 border-t border-[#21262d]">
                <p className="text-sm text-[#8b949e] mb-4">Need immediate assistance?</p>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-4 h-4 text-[#00d4ff]" />
                  <a href="mailto:sales@zcat.com" className="text-white hover:text-[#00d4ff] transition-colors">sales@zcat.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-white">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
