'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const testimonials = [
  {
    name: 'Rajesh Menon',
    role: 'CTO at TechNova',
    quote: 'ZCAT revolutionized our hiring pipeline. The AI proctoring catches issues our team would have missed, and the coding assessments are perfectly calibrated for our needs.',
    rating: 5,
  },
  {
    name: 'Anita Desai',
    role: 'HR Director at InnovateCorp',
    quote: 'We reduced our time-to-hire by 60% using ZCAT. The analytics dashboard gives us incredible insights into candidate performance and skill distribution.',
    rating: 5,
  },
  {
    name: 'Sanjay Patel',
    role: 'VP Engineering at CloudStack',
    quote: 'The coding environment is phenomenal — it feels just like a real IDE. Our candidates love the experience, and we get accurate skill assessments every time.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Campus Lead at IIT Delhi',
    quote: 'ZCAT made campus hiring seamless. The aptitude tests and coding challenges are well-designed, and the real-time monitoring gives us confidence in exam integrity.',
    rating: 4,
  },
  {
    name: 'Vikram Reddy',
    role: 'Founder at DataVerse AI',
    quote: 'As a startup, we needed an affordable yet powerful assessment tool. ZCAT delivers enterprise-grade features at a fraction of the cost of competitors.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const paginate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  const variants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title="What Our Users"
          gradient="Say About Us"
          description="Join thousands of companies and candidates who trust ZCAT for their assessment needs."
        />

        <div className="max-w-3xl mx-auto relative">
          <div className="glass-card rounded-2xl p-8 sm:p-10 min-h-[260px] flex flex-col justify-center relative overflow-hidden">
            {/* Quote icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-[#0066ff]/10" />

            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < testimonials[current].rating ? '#f59e0b' : 'transparent'}
                      color={i < testimonials[current].rating ? '#f59e0b' : '#484f58'}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg text-[#e4e8f1] leading-relaxed mb-6 italic">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
                    {testimonials[current].name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonials[current].name}</p>
                    <p className="text-xs text-[#8b949e]">{testimonials[current].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => paginate(-1)}
              className="p-2 rounded-lg glass border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#00d4ff]/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-[#00d4ff] w-6' : 'bg-[#30363d] hover:bg-[#484f58]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="p-2 rounded-lg glass border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#00d4ff]/30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
