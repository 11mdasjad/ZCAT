'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Globe, Check, GraduationCap, Calendar, FileText, Code } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { RedZcatLogo } from '@/components/shared/RedZcatLogo';
import toast from 'react-hot-toast';

const steps = ['Account', 'Details', 'Confirm'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Left — Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 via-[#7c3aed]/5 to-transparent" />
        
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2563eb]/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/15 rounded-full blur-[100px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-12 z-10"
        >
          <div className="flex justify-center mb-8">
            <RedZcatLogo height={48} />
          </div>
          <h2 className="text-4xl font-bold text-[#0f172a] mb-4">Join the future of <span className="gradient-text">Hiring</span></h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto leading-relaxed">Create your candidate profile to access AI-powered assessments and get matched with top companies.</p>
          
          {/* Floating stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 text-left border border-[#e2e8f0] shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center mb-3">
                <Code className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div className="text-xl font-bold text-[#0f172a] mb-1">500+</div>
              <div className="text-xs text-[#64748b] font-medium">Coding Challenges</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-4 text-left border border-[#e2e8f0] shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <div className="text-xl font-bold text-[#0f172a] mb-1">Top Tech</div>
              <div className="text-xs text-[#64748b] font-medium">Partner Companies</div>
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
          className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-xl"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ZCAT</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Create your account</h1>
          <p className="text-sm text-[#64748b] mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2563eb] font-semibold hover:underline">Sign in</Link>
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i <= step
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-sm'
                    : 'bg-slate-100 text-[#94a3b8] border border-[#e2e8f0]'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block transition-colors duration-300 ${i <= step ? 'text-[#0f172a] font-semibold' : 'text-[#94a3b8]'}`}>{s}</span>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-1 bg-[#e2e8f0] relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
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
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 relative overflow-hidden">
                    <div className="flex items-start gap-3 relative z-10">
                      <Building2 className="w-5 h-5 text-[#7c3aed] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#0f172a] mb-1">Are you a recruiter?</h4>
                        <p className="text-xs text-[#64748b] mb-3">
                          Recruiter accounts require admin approval for security and quality control.
                        </p>
                        <Link 
                          href="mailto:admin@zcat.com?subject=Recruiter%20Account%20Request"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 border border-purple-200 text-xs font-semibold text-[#7c3aed] hover:bg-purple-200 transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Contact Admin for Access
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                      <input type="text" value={formData.name} required onChange={(e) => update('name', e.target.value)} placeholder="John Doe" className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
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
                      <label className="block text-sm font-semibold text-[#475569] mb-1.5">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                        <input type="password" required value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 chars" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#475569] mb-1.5">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                        <input type="password" required value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm password" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#e2e8f0] my-2" />

                  {/* Candidate Profile Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#475569] mb-1.5">University / College</label>
                      <div className="relative group">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                        <input type="text" value={formData.university} onChange={(e) => update('university', e.target.value)} placeholder="MIT" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#475569] mb-1.5">Graduation Year</label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                        <input type="number" min="2000" max="2035" value={formData.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} placeholder="2025" className="input-neon w-full !pl-10" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5">Top Skills (comma separated)</label>
                    <div className="relative group">
                      <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
                      <input type="text" value={formData.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, Python, SQL" className="input-neon w-full !pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#475569] mb-1.5">Resume URL (Optional)</label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#2563eb] transition-colors" />
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
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center mx-auto mb-4 shadow-md"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-2">Review & Confirm</h3>
                    <p className="text-sm text-[#64748b]">Please verify your details before creating your account.</p>
                  </div>
                  <div className="space-y-3 bg-slate-50 border border-[#e2e8f0] rounded-xl p-5">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-[#64748b]">Role</span><span className="text-sm font-bold text-[#2563eb] px-2.5 py-1 bg-blue-100/70 rounded-md">Candidate</span></div>
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#64748b]">Name</span><span className="text-sm font-semibold text-[#0f172a]">{formData.name || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#64748b]">Email</span><span className="text-sm font-semibold text-[#0f172a]">{formData.email || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#64748b]">University</span><span className="text-sm font-semibold text-[#0f172a]">{formData.university || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-sm font-medium text-[#64748b]">Grad. Year</span><span className="text-sm font-semibold text-[#0f172a]">{formData.graduationYear || '—'}</span></div>
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 rounded border-[#cbd5e1] accent-[#2563eb] cursor-pointer" />
                    <label htmlFor="terms" className="text-xs text-[#64748b] leading-relaxed cursor-pointer font-medium">
                      I agree to the <Link href="#" className="text-[#2563eb] font-semibold hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#2563eb] font-semibold hover:underline">Privacy Policy</Link>, and consent to the processing of my data.
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-neon btn-neon-secondary flex items-center gap-2 px-6 font-semibold cursor-pointer">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 font-semibold cursor-pointer shadow-md">
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
                  <div className="flex-1 h-px bg-[#e2e8f0]" />
                  <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 h-px bg-[#e2e8f0]" />
                </div>
                <button type="button" onClick={handleGoogleSignIn} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0f172a] hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
                  <Globe className="w-4 h-4 text-[#2563eb]" /> Google
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
