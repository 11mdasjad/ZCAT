'use client';

import { motion } from 'framer-motion';

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
  'Uber', 'Stripe', 'Airbnb', 'Spotify', 'Adobe', 'Salesforce',
  'Oracle', 'IBM', 'Intel', 'Nvidia',
];

export default function TrustedSection() {
  return (
    <section className="relative py-16 border-y border-[#21262d]/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm font-medium text-[#484f58] uppercase tracking-widest">
          Trusted by 500+ leading companies worldwide
        </p>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#06080f] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#06080f] to-transparent z-10" />

        <div className="flex animate-[marquee_30s_linear_infinite]">
          {[...companies, ...companies].map((company, i) => (
            <div
              key={`${company}-${i}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <div className="px-6 py-3 rounded-lg bg-[#161b22]/50 border border-[#21262d]/50 text-[#484f58] font-semibold text-lg tracking-wide hover:text-[#8b949e] hover:border-[#30363d] transition-all duration-300 whitespace-nowrap">
                {company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
