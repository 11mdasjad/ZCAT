const companies = [
  { name: 'Google', slug: 'google-icon' },
  { name: 'Microsoft', slug: 'microsoft-icon' },
  { name: 'Meta', slug: 'meta' },
  { name: 'Apple', slug: 'apple' },
  { name: 'Netflix', slug: 'netflix-icon' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Airbnb', slug: 'airbnb-icon' },
  { name: 'Spotify', slug: 'spotify-icon' },
  { name: 'Salesforce', slug: 'salesforce' },
  { name: 'Oracle', slug: 'oracle' },
  { name: 'IBM', slug: 'ibm' },
  { name: 'Intel', slug: 'intel' },
  { name: 'Nvidia', slug: 'nvidia' },
];

export default function TrustedSection() {
  return (
    <section className="relative py-16 border-y border-[#e2e8f0] overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <p className="text-center text-sm font-semibold text-[#64748b] uppercase tracking-widest">
          Trusted by 500+ leading companies worldwide
        </p>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-[marquee_30s_linear_infinite]">
          {[...companies, ...companies].map((company, i) => (
            <div
              key={`${company.name}-${i}`}
              className="flex-shrink-0 mx-10 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-default"
              title={company.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://raw.githubusercontent.com/gilbarbara/logos/main/logos/${company.slug}.svg`} 
                alt={`${company.name} logo`} 
                className={`h-9 md:h-11 w-auto object-contain drop-shadow-xs rounded-md ${
                  ['apple', 'ibm', 'intel'].includes(company.slug) ? 'brightness-0 opacity-80' : ''
                }`}
                loading="lazy"
                decoding="async"
                width={44}
                height={44}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
