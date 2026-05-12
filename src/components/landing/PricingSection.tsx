'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const plans = [
  {
    name: 'Starter',
    price: 49,
    period: '/month',
    description: 'Perfect for small teams and startups getting started with assessments.',
    features: [
      'Up to 50 assessments/month',
      '5 coding languages',
      'Basic proctoring',
      'Email support',
      'Standard analytics',
      'Question bank access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: 149,
    period: '/month',
    description: 'Ideal for growing companies with advanced hiring needs.',
    features: [
      'Unlimited assessments',
      'All coding languages',
      'AI proctoring',
      'Priority support',
      'Advanced analytics',
      'Custom question bank',
      'Live monitoring',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: '',
    description: 'Custom solutions for large organizations with complex requirements.',
    features: [
      'Everything in Professional',
      'Custom branding',
      'Dedicated account manager',
      'SSO & SAML',
      'On-premise deployment',
      'Custom integrations',
      'SLA guarantee',
      'Unlimited users',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0066ff]/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          badge="Pricing"
          title="Simple, Transparent"
          gradient="Pricing"
          description="Choose the plan that fits your needs. All plans include a 14-day free trial."
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative glass-card rounded-2xl p-7 flex flex-col ${
                plan.popular
                  ? 'border-[#0066ff]/30 shadow-[0_0_40px_rgba(0,102,255,0.1)] scale-[1.02]'
                  : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-[#484f58] mb-5">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-sm text-[#8b949e]">{plan.period}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold gradient-text">Custom</div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#8b949e]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'btn-neon-primary bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white hover:shadow-[0_6px_25px_rgba(0,102,255,0.4)]'
                    : 'btn-neon-secondary border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#00d4ff]/30'
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
