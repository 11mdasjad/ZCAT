'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, ChevronDown, Loader2 } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { footerPagesData } from '@/lib/data/footerPages';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Proctoring', href: '/#proctoring' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navLoading, setNavLoading] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-shadow duration-300 z-10 relative">
                  <LogoIcon className="w-8 h-8" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-[#0066ff] to-[#7c3aed] rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-bold tracking-tight mt-0.5">
                <span className="gradient-text">ZCAT</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="relative group">
                {/* 
                  The button uses py-6 -my-4 to expand the hover area downwards 
                  so the dropdown doesn't close when the mouse moves from the button to the menu. 
                */}
                <button className="flex items-center gap-1 px-4 py-6 -my-4 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04]">
                  Solutions <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-[calc(100%-10px)] left-1/2 -translate-x-1/2 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 w-[320px]">
                  <div className="glass-strong rounded-xl border border-[#21262d] shadow-2xl p-2 flex flex-col gap-1">
                    {footerPagesData.solutions.map((solution) => (
                      <Link
                        key={solution.slug}
                        href={`/solutions/${solution.slug}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group/item"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${solution.gradient}`}>
                          <solution.icon className="w-5 h-5 text-white" style={{ color: solution.color }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover/item:text-[#00d4ff] transition-colors">
                            {solution.title}
                          </div>
                          <div className="text-xs text-[#8b949e] mt-0.5 line-clamp-1">
                            {solution.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {mounted ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setNavLoading('login')}
                    className="px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                  >
                    {navLoading === 'login' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00d4ff]" />}
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setNavLoading('register')}
                    className="btn-neon btn-neon-primary text-sm !py-2.5 !px-5 flex items-center gap-1.5"
                  >
                    {navLoading === 'register' && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-neon btn-neon-primary text-sm !py-2.5 !px-5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#8b949e] hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-20 glass-strong md:hidden"
          >
            <div className="flex flex-col items-center gap-2 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 text-lg font-medium text-[#8b949e] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-full h-px bg-[#21262d] my-4" />
              {mounted ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => {
                      setMobileOpen(false);
                      setNavLoading('login');
                    }}
                    className="w-full text-center py-3 text-lg font-medium text-[#00d4ff] flex items-center justify-center gap-2"
                  >
                    {navLoading === 'login' && <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" />}
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => {
                      setMobileOpen(false);
                      setNavLoading('register');
                    }}
                    className="w-full btn-neon btn-neon-primary text-center mt-2 flex items-center justify-center gap-2"
                  >
                    {navLoading === 'register' && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 text-lg font-medium text-[#00d4ff]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full btn-neon btn-neon-primary text-center mt-2"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
