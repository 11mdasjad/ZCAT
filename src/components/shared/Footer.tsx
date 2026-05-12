'use client';

import Link from 'next/link';
import { Zap, ExternalLink, MessageCircle, Link2, Video, Mail, ArrowRight } from 'lucide-react';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Coding Tests', href: '#' },
      { label: 'AI Proctoring', href: '#' },
      { label: 'Live Monitoring', href: '#' },
      { label: 'Analytics', href: '#' },
      { label: 'Hackathons', href: '#' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Campus Hiring', href: '#' },
      { label: 'Technical Interviews', href: '#' },
      { label: 'Skill Assessment', href: '#' },
      { label: 'Recruitment', href: '#' },
      { label: 'Certifications', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: ExternalLink, href: '#', label: 'GitHub' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: Link2, href: '#', label: 'LinkedIn' },
  { icon: Video, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[#21262d] bg-[#06080f]">
      {/* Gradient Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0066ff] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-[#21262d]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Stay Ahead of the Curve</h3>
              <p className="text-[#8b949e] text-sm">Get the latest updates on AI-powered assessments and hiring trends.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-neon flex-1 md:w-72 !rounded-r-none"
              />
              <button className="btn-neon btn-neon-primary !rounded-l-none flex items-center gap-2 whitespace-nowrap">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">ZCAT</span>
            </Link>
            <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
              AI-powered assessment platform for smart hiring, testing, and skill evaluation.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#8b949e] hover:text-[#00d4ff] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#484f58]">
            © {new Date().getFullYear()} ZCAT. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#484f58] hover:text-[#8b949e] transition-colors">Privacy</a>
            <a href="#" className="text-sm text-[#484f58] hover:text-[#8b949e] transition-colors">Terms</a>
            <a href="#" className="text-sm text-[#484f58] hover:text-[#8b949e] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
