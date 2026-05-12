'use client';

import { motion } from 'framer-motion';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Contact"
          title="Get in"
          gradient="Touch"
          description="Have questions? We'd love to hear from you. Send us a message and we'll respond promptly."
        />

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 glass-card rounded-2xl p-7"
          >
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Name</label>
                  <input type="text" placeholder="John Doe" className="input-neon w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
                  <input type="email" placeholder="john@company.com" className="input-neon w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Subject</label>
                <input type="text" placeholder="How can we help?" className="input-neon w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Message</label>
                <textarea rows={5} placeholder="Tell us more about your needs..." className="input-neon w-full resize-none" />
              </div>
              <button
                type="submit"
                className="btn-neon btn-neon-primary flex items-center gap-2 w-full justify-center"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#00d4ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Office</p>
                    <p className="text-xs text-[#8b949e]">Bangalore, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#a855f7]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-xs text-[#8b949e]">hello@zcat.dev</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Phone</p>
                    <p className="text-xs text-[#8b949e]">+91 (800) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="glass-card rounded-2xl overflow-hidden aspect-[4/3] relative">
              <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#00d4ff] mx-auto mb-2" />
                  <p className="text-sm text-[#484f58]">Interactive Map</p>
                  <p className="text-xs text-[#30363d]">Bangalore, India</p>
                </div>
              </div>
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid opacity-50" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
