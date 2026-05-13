'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    university: '', graduationYear: '', resumeUrl: '', skills: ''
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
    
    const { error } = await supabase.auth.signUp({
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
      toast.success('Registration successful! Please check your email to verify.');
      router.push('/login');
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
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">ZCAT</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1 text-center">Create your account</h1>
        <p className="text-sm text-[#8b949e] mb-8 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00d4ff] hover:underline">Sign in</Link>
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i <= step
                  ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white'
                  : 'bg-[#161b22] text-[#484f58] border border-[#21262d]'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i <= step ? 'text-white' : 'text-[#484f58]'}`}>{s}</span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-[#0066ff]' : 'bg-[#21262d]'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7">
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Recruiter Contact Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/20">
                <div className="flex items-start gap-3">
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="text" value={formData.name} required onChange={(e) => update('name', e.target.value)} placeholder="John Doe" className="input-neon w-full !pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="email" value={formData.email} required onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" className="input-neon w-full !pl-10" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                    <input type="password" required value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 chars" className="input-neon w-full !pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                    <input type="password" required value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm password" className="input-neon w-full !pl-10" />
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-[#21262d] my-4" />

              {/* Candidate Profile Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">University / College</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                    <input type="text" value={formData.university} onChange={(e) => update('university', e.target.value)} placeholder="MIT" className="input-neon w-full !pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Graduation Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                    <input type="number" min="2000" max="2035" value={formData.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} placeholder="2025" className="input-neon w-full !pl-10" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Top Skills (comma separated)</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="text" value={formData.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, Python, SQL" className="input-neon w-full !pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Resume URL (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="url" value={formData.resumeUrl} onChange={(e) => update('resumeUrl', e.target.value)} placeholder="https://..." className="input-neon w-full !pl-10" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Review & Confirm</h3>
                <p className="text-sm text-[#8b949e]">Please verify your details before creating your account.</p>
              </div>
              <div className="space-y-3 bg-[#161b22]/50 rounded-xl p-4">
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Role</span><span className="text-sm text-white">Candidate</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Name</span><span className="text-sm text-white">{formData.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Email</span><span className="text-sm text-white">{formData.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">University</span><span className="text-sm text-white">{formData.university || '—'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Grad. Year</span><span className="text-sm text-white">{formData.graduationYear || '—'}</span></div>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-[#21262d] bg-[#161b22] accent-[#0066ff]" />
                <label htmlFor="terms" className="text-xs text-[#8b949e]">
                  I agree to the <a href="#" className="text-[#00d4ff] hover:underline">Terms of Service</a> and <a href="#" className="text-[#00d4ff] hover:underline">Privacy Policy</a>
                </label>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-neon btn-neon-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button type="submit" disabled={loading} className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step < 2 ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {step === 0 && (
            <>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex-1 h-px bg-[#21262d]" />
                <span className="text-xs text-[#484f58]">or</span>
                <div className="flex-1 h-px bg-[#21262d]" />
              </div>
              <button type="button" onClick={handleGoogleSignIn} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#21262d] bg-[#161b22]/50 text-sm font-medium text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all">
                <Globe className="w-4 h-4" /> Sign up with Google
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
