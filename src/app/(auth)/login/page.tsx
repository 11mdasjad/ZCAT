'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '@/components/shared/LogoIcon';
import { RedZcatLogo } from '@/components/shared/RedZcatLogo';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success('Logged in successfully!');
      
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (user?.role === 'ADMIN' || user?.role === 'RECRUITER' || user?.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/candidate';
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
          <h2 className="text-4xl font-bold text-[#0f172a] mb-4">Welcome back</h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto leading-relaxed">AI-powered assessment platform for smart hiring, testing, and skill evaluation.</p>
          
          {/* Floating stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { label: 'Assessments', value: '1M+' },
              { label: 'Companies', value: '500+' },
              { label: 'Accuracy', value: '98%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-3 text-center border border-[#e2e8f0] shadow-sm">
                <div className="text-lg font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-[#64748b] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
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

          <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Sign in to your account</h1>
          <p className="text-sm text-[#64748b] mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#2563eb] font-semibold hover:underline">Create one</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#475569] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="input-neon w-full !pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#475569]">Password</label>
                <a href="#" className="text-xs text-[#2563eb] font-semibold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-neon w-full !pl-10 !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-[#cbd5e1] accent-[#2563eb] cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-[#64748b] font-medium cursor-pointer">Remember me</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-neon btn-neon-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 font-semibold cursor-pointer shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#e2e8f0]" />
              <span className="text-xs font-semibold text-[#94a3b8]">or continue with</span>
              <div className="flex-1 h-px bg-[#e2e8f0]" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0f172a] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#2563eb]" /> Google
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
