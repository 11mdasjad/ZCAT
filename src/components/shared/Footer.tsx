import Link from 'next/link';
import { Zap, ExternalLink, MessageCircle, Link2, Video, ArrowRight } from 'lucide-react';
import { RedZcatLogo } from './RedZcatLogo';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Coding Tests', href: '/features/coding-assessment' },
      { label: 'AI Proctoring', href: '/features/ai-proctoring' },
      { label: 'Live Monitoring', href: '/features/live-monitoring' },
      { label: 'Analytics', href: '/features/real-time-analytics' },
      { label: 'AI Interview', href: '/features/ai-interview' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Campus Hiring', href: '/solutions/campus-hiring' },
      { label: 'Technical Interviews', href: '/solutions/technical-interviews' },
      { label: 'Skill Assessment', href: '/solutions/skill-assessment' },
      { label: 'Recruitment', href: '/solutions/recruitment' },
      { label: 'Certifications', href: '/solutions/certifications' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/company/about-us' },
      { label: 'Careers', href: '/company/careers' },
      { label: 'Blog', href: '/company/blog' },
      { label: 'Press', href: '/company/press' },
      { label: 'Contact', href: '/company/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/resources/documentation' },
      { label: 'API Reference', href: '/resources/api-reference' },
      { label: 'Support', href: '/resources/support' },
      { label: 'Community', href: '/resources/community' },
      { label: 'Status', href: '/resources/status' },
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
    <footer className="relative border-t border-[#e2e8f0] bg-white">
      {/* Gradient Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563eb] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-[#e2e8f0]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">Stay Ahead of the Curve</h3>
              <p className="text-[#64748b] text-sm">Get the latest updates on AI-powered assessments and hiring trends.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-neon flex-1 md:w-72 !rounded-r-none border-r-0"
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
              <RedZcatLogo height={32} />
            </Link>
            <p className="text-[#64748b] text-sm leading-relaxed mb-6">
              AI-powered assessment platform for smart hiring, testing, and skill evaluation.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#2563eb] hover:border-[#2563eb]/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-[#0f172a] mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#64748b] hover:text-[#2563eb] transition-colors duration-200"
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
        <div className="py-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#94a3b8]">
            © {new Date().getFullYear()} ZCAT. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#94a3b8] hover:text-[#475569] transition-colors">Privacy</a>
            <a href="#" className="text-sm text-[#94a3b8] hover:text-[#475569] transition-colors">Terms</a>
            <a href="#" className="text-sm text-[#94a3b8] hover:text-[#475569] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
