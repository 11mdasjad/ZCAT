'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Globe, Check, GraduationCap, Calendar, FileText, Code } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const steps = ['Account', 'Details', 'Confirm'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  // Locked to candidate role only - recruiters must contact admin
  const role = 'candidate';
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', 
    university: '', graduationYear: '', resumeUrl: '', skills: '',
    company: '', jobTitle: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { 
      if (step === 0 && (!formData.name || !formData.email)) {
        toast.error('Please fill in all fields');
        return;
      }
      if (step === 1 && (formData.password !== formData.confirmPassword || formData.password.length < 6)) {
        toast.error('Passwords must match and be at least 6 characters');
        return;
      }
      setStep(step + 1); 
      return; 
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          role: role,
          university: formData.university || null,
          graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
          resume_url: formData.resumeUrl || null,
          company_name: formData.company || null,
          job_title: formData.jobTitle || null,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      if (data.session) {
        toast.success('Account created successfully!');
        window.location.href = '/candidate';
      } else {
        toast.success('Registration successful! Please check your email to verify.');
        router.push('/login');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066ff]/10 via-[#7c3aed]/5 to-transparent" />
        
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0066ff]/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[100px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-12 z-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(0,102,255,0.3)]">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join the future of <span className="gradient-text">Hiring</span></h2>
          <p className="text-[#8b949e] text-lg max-w-md mx-auto">Create your candidate profile to access AI-powered assessments and get matched with top companies.</p>
          
          {/* Floating stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card rounded-xl p-4 text-left border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0066ff]/20 flex items-center justify-center mb-3">
                <Code className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div className="text-xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-[#8b949e]">Coding Challenges</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass-card rounded-xl p-4 text-left border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div className="text-xl font-bold text-white mb-1">Top Tech</div>
              <div className="text-xs text-[#8b949e]">Partner Companies</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ZCAT</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-[#8b949e] mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00d4ff] hover:underline">Sign in</Link>
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  i <= step
                    ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]'
                    : 'bg-[#161b22] text-[#484f58] border border-[#21262d]'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block transition-colors duration-300 ${i <= step ? 'text-white font-medium' : 'text-[#484f58]'}`}>{s}</span>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-1 bg-[#21262d] relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0066ff] to-[#7c3aed]"
                      initial={{ width: '0%' }}
                      animate={{ width: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div 
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Recruiter Contact Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/0 via-[#a855f7]/5 to-[#a855f7]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-start gap-3 relative z-10">
                      <Building2 className="w-5 h-5 text-[#a855f7] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">Are you a recruiter?</h4>
                        <p className="text-xs text-[#8b949e] mb-3">
                          Recruiter accounts require admin approval for security and quality control.
                        </p>
                        <Link 
                          href="mailto:admin@zcat.com?subject=Recruiter%20Account%20Request"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#a855f7]/20 border border-[#a855f7]/30 text-xs font-medium text-[#a855f7] hover:bg-[#a855f7]/30 transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Contact Admin for Access
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                      <input type="text" value={formData.name} required onChange={(e) => update('name', e.target.value)} placeholder="John Doe" className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                      <input type="email" value={formData.email} required onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                        <input type="password" required value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 chars" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                        <input type="password" required value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm password" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#21262d] my-2" />

                  {/* Candidate Profile Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5">University / College</label>
                      <div className="relative group">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                        <input type="text" value={formData.university} onChange={(e) => update('university', e.target.value)} placeholder="MIT" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Graduation Year</label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                        <input type="number" min="2000" max="2035" value={formData.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} placeholder="2025" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Top Skills (comma separated)</label>
                    <div className="relative group">
                      <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                      <input type="text" value={formData.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, Python, SQL" className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Resume URL (Optional)</label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-[#00d4ff] transition-colors" />
                      <input type="url" value={formData.resumeUrl} onChange={(e) => update('resumeUrl', e.target.value)} placeholder="https://..." className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="text-center py-2">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white mb-2">Review & Confirm</h3>
                    <p className="text-sm text-[#8b949e]">Please verify your details before creating your account.</p>
                  </div>
                  <div className="space-y-3 bg-[#161b22]/50 border border-[#21262d] rounded-xl p-5">
                    <div className="flex justify-between items-center"><span className="text-sm text-[#484f58]">Role</span><span className="text-sm font-medium text-white px-2 py-1 bg-[#0066ff]/10 text-[#00d4ff] rounded-md">Candidate</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[#484f58]">Name</span><span className="text-sm text-white">{formData.name || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[#484f58]">Email</span><span className="text-sm text-white">{formData.email || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[#484f58]">University</span><span className="text-sm text-white">{formData.university || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[#484f58]">Grad. Year</span><span className="text-sm text-white">{formData.graduationYear || '—'}</span></div>
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 rounded border-[#21262d] bg-[#161b22] accent-[#0066ff]" />
                    <label htmlFor="terms" className="text-xs text-[#8b949e] leading-relaxed">
                      I agree to the <Link href="#" className="text-[#00d4ff] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#00d4ff] hover:underline">Privacy Policy</Link>, and consent to the processing of my data.
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-neon btn-neon-secondary flex items-center gap-2 px-6">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step < 2 ? (
                  <>Next Step <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Create Account <Zap className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {step === 0 && (
              <>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex-1 h-px bg-[#21262d]" />
                  <span className="text-xs text-[#484f58] uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 h-px bg-[#21262d]" />
                </div>
                <button type="button" onClick={handleGoogleSignIn} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#21262d] bg-[#161b22]/50 text-sm font-medium text-[#8b949e] hover:text-white hover:border-[#30363d] hover:bg-white/[0.02] transition-all duration-300">
                  <Globe className="w-4 h-4" /> Google
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
