import { 
  Building, GraduationCap, Code, Briefcase, Award, 
  Users, Newspaper, Megaphone, MapPin, 
  BookOpen, Terminal, LifeBuoy, Heart, Activity,
  LucideIcon
} from 'lucide-react';

export interface FooterPageData {
  slug: string;
  category: string;
  icon: LucideIcon;
  title: string;
  description: string;
  fullDescription: string;
  sections: { title: string; description: string }[];
  color: string;
  gradient: string;
}

export const footerPagesData: Record<string, FooterPageData[]> = {
  solutions: [
    {
      slug: 'campus-hiring',
      category: 'solutions',
      icon: GraduationCap,
      title: 'Campus Hiring',
      description: 'Streamline university recruitment at scale with automated assessments.',
      fullDescription: 'ZCAT transforms campus hiring from a logistical nightmare into a seamless, data-driven process. Screen thousands of graduates simultaneously with our high-concurrency architecture, ensuring a fair and standardized evaluation across multiple universities.',
      sections: [
        { title: 'High-Volume Screening', description: 'Host simultaneous online tests for over 10,000+ candidates without a drop in performance or platform stability.' },
        { title: 'Automated Shortlisting', description: 'Instantly generate merit lists based on customizable scoring rubrics, filtering out candidates who do not meet your exact criteria.' },
        { title: 'Anti-Impersonation', description: 'Strict AI proctoring ensures the student who takes the test is the one who shows up for the final interview.' }
      ],
      color: '#00d4ff',
      gradient: 'from-[#00d4ff]/20 to-[#0066ff]/20',
    },
    {
      slug: 'technical-interviews',
      category: 'solutions',
      icon: Code,
      title: 'Technical Interviews',
      description: 'Collaborative IDEs and structured rubrics for live technical rounds.',
      fullDescription: 'Elevate your live engineering interviews. Our technical interview solution pairs a real-time collaborative code editor with integrated video calling, allowing interviewers and candidates to write, execute, and debug code together seamlessly.',
      sections: [
        { title: 'Collaborative IDE', description: 'A shared coding canvas with multi-cursor support, syntax highlighting, and live execution capabilities.' },
        { title: 'Integrated Video/Audio', description: 'No need for external meeting links. High-quality WebRTC video and audio are built directly into the interview environment.' },
        { title: 'Standardized Rubrics', description: 'Interviewers can score candidates on specific competencies (e.g., Code Quality, System Design, Communication) directly within the platform.' }
      ],
      color: '#a855f7',
      gradient: 'from-[#a855f7]/20 to-[#7c3aed]/20',
    },
    {
      slug: 'skill-assessment',
      category: 'solutions',
      icon: Activity,
      title: 'Skill Assessment',
      description: 'Validate candidate competencies across 50+ technology stacks.',
      fullDescription: 'Move beyond the resume. ZCAT provides an extensive library of pre-built skill assessments covering everything from frontend frameworks (React, Vue) and backend languages (Node.js, Java) to DevOps, Data Science, and AI/ML.',
      sections: [
        { title: 'Pre-built Question Library', description: 'Access over 5,000 vetted questions, or let our Gemini-powered AI generate fresh questions on demand.' },
        { title: 'Role-based Templates', description: 'Select pre-configured assessment templates designed by industry experts for roles like Full-Stack Developer or Data Engineer.' },
        { title: 'Granular Reporting', description: 'Receive deep insights into a candidate’s specific strengths and weaknesses across various sub-domains.' }
      ],
      color: '#10b981',
      gradient: 'from-[#10b981]/20 to-[#059669]/20',
    },
    {
      slug: 'recruitment',
      category: 'solutions',
      icon: Briefcase,
      title: 'Lateral Recruitment',
      description: 'Accelerate the hiring pipeline for experienced professionals.',
      fullDescription: 'Time is of the essence when hiring senior talent. ZCAT optimizes the lateral recruitment funnel by replacing time-consuming initial phone screens with asynchronous, high-signal technical assessments and AI interviews.',
      sections: [
        { title: 'Take-home Projects', description: 'Assign complex, real-world mini-projects that candidates can complete in their own local IDEs and sync via Git.' },
        { title: 'Asynchronous Video Pitches', description: 'Allow candidates to record video explanations of their code or architecture designs.' },
        { title: 'ATS Integrations', description: 'Seamlessly push scores and interview transcripts to Greenhouse, Lever, and Workday.' }
      ],
      color: '#f59e0b',
      gradient: 'from-[#f59e0b]/20 to-[#d97706]/20',
    },
    {
      slug: 'certifications',
      category: 'solutions',
      icon: Award,
      title: 'Certifications',
      description: 'Host secure certification exams and issue verifiable credentials.',
      fullDescription: 'Whether you are an enterprise certifying your partner ecosystem or an educational institution, ZCAT provides the secure infrastructure needed to host high-stakes certification exams globally.',
      sections: [
        { title: 'Verifiable Credentials', description: 'Automatically issue blockchain-backed or digitally signed PDF certificates upon successful exam completion.' },
        { title: 'Strict Proctoring', description: 'Enforce maximum security with browser lockdown, live proctors, and multi-factor authentication.' },
        { title: 'Monetization & White-labeling', description: 'Host exams on your own domain with full custom branding and integrate payment gateways for candidate registration.' }
      ],
      color: '#ec4899',
      gradient: 'from-[#ec4899]/20 to-[#db2777]/20',
    }
  ],
  company: [
    {
      slug: 'about-us',
      category: 'company',
      icon: Building,
      title: 'About Us',
      description: 'Our mission to revolutionize technical hiring through AI.',
      fullDescription: 'ZCAT was founded with a singular vision: to make technical hiring fairer, faster, and more data-driven. We believe that a candidate’s true potential lies in their ability to solve problems, not in how well they format their resume. By leveraging cutting-edge Artificial Intelligence, we are removing human bias and logistical bottlenecks from the global recruitment process.',
      sections: [
        { title: 'Our Story', description: 'Started by a team of frustrated engineering managers who spent too much time interviewing the wrong candidates, ZCAT has grown into a global platform trusted by top enterprises.' },
        { title: 'Our Mission', description: 'To democratize access to tech opportunities by providing an objective, skill-first evaluation platform for every candidate in the world.' },
        { title: 'Our Values', description: 'We value integrity above all. We build tools that respect candidate privacy while providing uncompromising assessment security to employers.' }
      ],
      color: '#00d4ff',
      gradient: 'from-[#00d4ff]/20 to-[#0066ff]/20',
    },
    {
      slug: 'careers',
      category: 'company',
      icon: Users,
      title: 'Careers',
      description: 'Join the team building the future of hiring.',
      fullDescription: 'We are always looking for passionate engineers, designers, and go-to-market specialists to join our fully remote, globally distributed team. At ZCAT, you will tackle incredibly hard problems involving real-time web technologies, distributed systems, and applied AI.',
      sections: [
        { title: 'Remote-First Culture', description: 'Work from anywhere. We care about your output, not your office hours. We provide stipends for home offices and co-working spaces.' },
        { title: 'Continuous Growth', description: 'We invest in our people. Enjoy a generous learning and development budget for courses, conferences, and books.' },
        { title: 'Open Roles', description: 'We are currently hiring for Senior Full-Stack Engineers, AI Researchers, and Customer Success Managers. (Please check our ATS board for active listings).' }
      ],
      color: '#a855f7',
      gradient: 'from-[#a855f7]/20 to-[#7c3aed]/20',
    },
    {
      slug: 'blog',
      category: 'company',
      icon: Newspaper,
      title: 'Blog',
      description: 'Insights on engineering leadership, AI, and hiring trends.',
      fullDescription: 'The ZCAT Engineering & Leadership Blog is where our team shares deep-dives into how we build our platform, insights on the shifting landscape of technical recruitment, and best practices for building high-performing engineering teams.',
      sections: [
        { title: 'Engineering Deep Dives', description: 'Read about our transition to Turbopack, how we built our isolated Docker sandbox, and our adventures in real-time WebRTC.' },
        { title: 'Hiring Insights', description: 'Data-driven articles on why traditional whiteboard interviews are failing and how to design inclusive assessments.' },
        { title: 'Product Updates', description: 'Be the first to know about new feature releases, platform updates, and integration partnerships.' }
      ],
      color: '#ec4899',
      gradient: 'from-[#ec4899]/20 to-[#db2777]/20',
    },
    {
      slug: 'press',
      category: 'company',
      icon: Megaphone,
      title: 'Press & Media',
      description: 'Brand assets, press releases, and media inquiries.',
      fullDescription: 'Welcome to the ZCAT Press Room. Here you can find our latest announcements, download official high-resolution brand assets, and get in touch with our PR team for interviews or comments on industry trends.',
      sections: [
        { title: 'Press Releases', description: 'Archive of our latest funding announcements, major product launches, and strategic partnerships.' },
        { title: 'Brand Kit', description: 'Download our official logo package (SVG, PNG), brand guidelines, and executive headshots.' },
        { title: 'Media Contacts', description: 'For all press inquiries, please email press@zcat.com.' }
      ],
      color: '#f59e0b',
      gradient: 'from-[#f59e0b]/20 to-[#d97706]/20',
    },
    {
      slug: 'contact',
      category: 'company',
      icon: MapPin,
      title: 'Contact Us',
      description: 'Get in touch with our sales and support teams.',
      fullDescription: 'Whether you are interested in a custom enterprise plan, need technical support, or just want to say hello, our team is here to help. Reach out to us through the appropriate channels below.',
      sections: [
        { title: 'Sales Inquiry', description: 'Looking to scale your hiring? Email sales@zcat.com or book a demo directly through our platform.' },
        { title: 'Technical Support', description: 'Facing an issue during an assessment? Our 24/7 support team is available via the in-app chat widget or at support@zcat.com.' },
        { title: 'Global Offices', description: 'ZCAT is headquartered in San Francisco, CA, with secondary engineering hubs in London and Bangalore.' }
      ],
      color: '#10b981',
      gradient: 'from-[#10b981]/20 to-[#059669]/20',
    }
  ],
  resources: [
    {
      slug: 'documentation',
      category: 'resources',
      icon: BookOpen,
      title: 'Documentation',
      description: 'Comprehensive guides for administrators and candidates.',
      fullDescription: 'Explore our detailed knowledge base. The ZCAT documentation covers everything from initial account setup and integrating with your ATS, to deep-dives into our scoring algorithms and proctoring strictness settings.',
      sections: [
        { title: 'Administrator Guides', description: 'Learn how to create assessments, configure anti-cheating thresholds, and invite team members.' },
        { title: 'Candidate Help Center', description: 'Resources to help candidates prepare their environment, test their webcam, and troubleshoot network issues.' },
        { title: 'Integration Tutorials', description: 'Step-by-step walkthroughs for connecting ZCAT to Greenhouse, Workday, and Slack.' }
      ],
      color: '#00d4ff',
      gradient: 'from-[#00d4ff]/20 to-[#0066ff]/20',
    },
    {
      slug: 'api-reference',
      category: 'resources',
      icon: Terminal,
      title: 'API Reference',
      description: 'Build custom workflows with our REST and GraphQL APIs.',
      fullDescription: 'For enterprise customers who need deep, programmatic access to the ZCAT platform, we offer comprehensive REST and GraphQL APIs. Automate candidate invitations, fetch detailed performance metrics, and build custom dashboards.',
      sections: [
        { title: 'Authentication', description: 'Learn how to generate API keys and use Bearer token authentication securely.' },
        { title: 'Endpoints & Webhooks', description: 'Detailed schema definitions for all endpoints, and instructions for setting up webhooks to listen for assessment completion events.' },
        { title: 'Rate Limits & Best Practices', description: 'Understand our API rate limits and how to implement exponential backoff strategies for robust integrations.' }
      ],
      color: '#a855f7',
      gradient: 'from-[#a855f7]/20 to-[#7c3aed]/20',
    },
    {
      slug: 'support',
      category: 'resources',
      icon: LifeBuoy,
      title: 'Support Center',
      description: '24/7 technical assistance for employers and test-takers.',
      fullDescription: 'We understand that assessments are time-critical. Our global support team is available 24/7 to ensure zero downtime and immediate resolution for both employers configuring tests and candidates taking them.',
      sections: [
        { title: 'Live Chat', description: 'Enterprise customers get priority access to our engineering support team via live chat.' },
        { title: 'Ticket System', description: 'Submit a detailed bug report or feature request through our Zendesk portal.' },
        { title: 'System Diagnostics', description: 'Run automated browser compatibility and network latency tests before starting an exam.' }
      ],
      color: '#ec4899',
      gradient: 'from-[#ec4899]/20 to-[#db2777]/20',
    },
    {
      slug: 'community',
      category: 'resources',
      icon: Heart,
      title: 'Community',
      description: 'Join thousands of recruiters and developers.',
      fullDescription: 'The ZCAT Community is a vibrant ecosystem where technical recruiters, hiring managers, and developers come together. Share assessment templates, discuss interview strategies, and network with peers.',
      sections: [
        { title: 'Discord Server', description: 'Join our active Discord to chat with the core engineering team and other ZCAT power users.' },
        { title: 'Template Marketplace', description: 'Browse and download open-source assessment templates created and vetted by the community.' },
        { title: 'Events & Webinars', description: 'Register for our monthly webinars on topics ranging from "Mitigating AI Cheating" to "Improving Candidate Experience."' }
      ],
      color: '#f59e0b',
      gradient: 'from-[#f59e0b]/20 to-[#d97706]/20',
    },
    {
      slug: 'status',
      category: 'resources',
      icon: Activity,
      title: 'System Status',
      description: 'Real-time uptime monitoring and incident reports.',
      fullDescription: 'Transparency is critical to our operations. The System Status page provides real-time information on the operational status of all ZCAT services, including the Code Execution Engine, Proctoring AI, and Web App.',
      sections: [
        { title: 'Live Uptime Metrics', description: 'View real-time and historical uptime percentages across all global regions (US, EU, Asia).' },
        { title: 'Incident History', description: 'Read detailed post-mortems and RCA (Root Cause Analysis) reports for any past service disruptions.' },
        { title: 'Maintenance Schedule', description: 'Subscribe to SMS or Email alerts to get notified about upcoming scheduled maintenance windows.' }
      ],
      color: '#10b981',
      gradient: 'from-[#10b981]/20 to-[#059669]/20',
    }
  ]
};
