'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Proctoring', href: '#proctoring' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
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
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-shadow duration-300">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-[#0066ff] to-[#7c3aed] rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="gradient-text">ZCAT</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04]"
                >
                  {link.label}
                </a>
              ))}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#8b949e] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04]">
                  Solutions <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
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
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 text-lg font-medium text-[#8b949e] hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="w-full h-px bg-[#21262d] my-4" />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
