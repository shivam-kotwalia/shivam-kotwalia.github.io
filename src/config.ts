// =============================================================================
// SITE CONFIG — single source of truth for Shivam's personal site.
// Update the values below to change content across the whole website.
// TODO: Replace placeholder values marked with `TODO:` with real details.
// =============================================================================

export const site = {
  name: 'Shivam Kotwalia',
  role: 'GenAI & ML Consultant | Ex-Meta, McKinsey',
  tagline:
    'I help businesses turn GenAI and analytics into measurable growth, faster decisions, and stronger products.',
  bio: 'Strategy and data leader with 12+ years across fintech, consumer tech, and consulting. I partner with leadership teams to ship.',
  url: 'https://shivam-kotwalia.github.io',
  email: '',
  location: 'India',
  avatar: '/shivam.jpg',
  resume: '',
} as const;

export type SocialLink = {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'twitter' | 'email' | 'rss';
};

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/shivam-kotwalia', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shivamkotwalia/', icon: 'linkedin' },
];

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Advisory', href: '/advisory' },
  { label: 'Blog', href: '/blog' },
];

export const skillGroups: { title: string; skills: string[] }[] = [
  {
    title: 'Machine Learning & AI',
    skills: ['Generative AI', 'LLMs', 'Machine Learning', 'Deep Learning', 'Prompt Systems', 'AI Automation'],
  },
  {
    title: 'Strategy & Analytics',
    skills: ['Growth Strategy', 'Product Analytics', 'CXO Advisory', 'Decision Science', 'Experimentation', 'Commercial Performance'],
  },
  {
    title: 'Industries & Domains',
    skills: ['Fintech', 'Quick Commerce', 'FMCG', 'Insurance', 'Energy', 'Digital Transformation'],
  },
];

export const aboutParagraphs: string[] = [
  'Shivam is a strategy and data leader with 12 years of experience helping businesses drive growth, launch new products, and solve complex operational challenges through analytics, AI, and data-driven decision making.',
  'He has partnered closely with CXOs across fintech, FMCG, insurance, and energy sectors to improve commercial performance and scale new business initiatives. He specializes in the practical application of Machine Learning and Generative AI, with experience leading large-scale deployments across multiple industries.',
  'Currently, he leads GenAI, Strategy and Analytics for PhonePe\'s quick-commerce business, Pincode. Previously, at Tide, he helped build the data foundation for the business and shaped the Savings and Commercial Banking verticals. At Meta, he contributed to the launch and growth of Instagram Reels in India. Before that, at McKinsey, he advised Fortune 500 organizations on digital transformation, operational efficiency, and AI-driven automation.',
  'Outside work, Shivam advises early-stage startups on AI strategy and implementation and is passionate about teaching Machine Learning and GenAI. He has trained more than 10,000 students globally and actively contributes to the open-source community.',
];

export const focusAreas: string[] = [
  'Applied GenAI for business workflows and growth',
  'AI strategy for new products and operating models',
  'Analytics organizations, capability building, and mentoring',
  'Data-driven GTM and commercial optimization',
];

export const profileBullets: string[] = [
  '12+ years across Strategy, AI & Analytics',
  'Trained 10,000+ learners in ML and GenAI',
  'Advices startups on AI strategy and implementation',
];

export const advisoryTracks: { title: string; summary: string; outcomes: string[] }[] = [
  {
    title: 'GenAI Strategy For Leadership Teams',
    summary:
      'Translate AI ambition into a pragmatic roadmap tied to business priorities, operating model, and measurable outcomes.',
    outcomes: [
      'Prioritized GenAI opportunity map',
      'Execution roadmap with capability milestones',
      'Risk, governance, and adoption plan',
    ],
  },
  {
    title: 'AI Product & Growth Advisory',
    summary:
      'Design AI-powered product and growth loops that improve activation, retention, and monetization without over-engineering.',
    outcomes: [
      'Analytics and experimentation framework',
      'High-impact use case backlog',
      'Cross-functional operating cadence',
    ],
  },
  {
    title: 'Team Enablement & Workshops',
    summary:
      'Upskill product, data, and business teams through practical sessions focused on implementation rather than theory.',
    outcomes: [
      'Leadership and practitioner workshops',
      'Reusable playbooks and templates',
      'Hands-on mentoring for execution teams',
    ],
  },
];
