'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Globe, Check } from 'lucide-react';

const steps = ['Account', 'Details', 'Confirm'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', company: '', college: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    setLoading(true);
    setTimeout(() => router.push('/login'), 1500);
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
              <div className="grid grid-cols-2 gap-3">
                {(['candidate', 'recruiter'] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`p-3 rounded-xl border text-left transition-all ${
                    role === r ? 'border-[#0066ff]/50 bg-[#0066ff]/10' : 'border-[#21262d] bg-[#161b22]/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {r === 'candidate' ? <User className="w-4 h-4 text-[#00d4ff]" /> : <Building2 className="w-4 h-4 text-[#a855f7]" />}
                      <span className="text-sm font-medium text-white capitalize">{r}</span>
                    </div>
                    <p className="text-xs text-[#484f58]">{r === 'candidate' ? 'Take tests & challenges' : 'Create & manage assessments'}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" className="input-neon w-full !pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" className="input-neon w-full !pl-10" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="password" value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" className="input-neon w-full !pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input type="password" value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm password" className="input-neon w-full !pl-10" />
                </div>
              </div>
              {role === 'recruiter' && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                    <input type="text" value={formData.company} onChange={(e) => update('company', e.target.value)} placeholder="Company name" className="input-neon w-full !pl-10" />
                  </div>
                </div>
              )}
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
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Role</span><span className="text-sm text-white capitalize">{role}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Name</span><span className="text-sm text-white">{formData.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#484f58]">Email</span><span className="text-sm text-white">{formData.email || '—'}</span></div>
                {role === 'recruiter' && <div className="flex justify-between"><span className="text-sm text-[#484f58]">Company</span><span className="text-sm text-white">{formData.company || '—'}</span></div>}
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-[#21262d] bg-[#161b22] accent-[#0066ff]" />
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
              <button type="button" className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#21262d] bg-[#161b22]/50 text-sm font-medium text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all">
                <Globe className="w-4 h-4" /> Sign up with Google
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
