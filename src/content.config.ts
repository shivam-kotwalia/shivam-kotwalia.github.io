import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Blog posts live in src/content/blog/*.md(x)
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      cover: image().optional(),
    }),
});

// Career timeline entries live in src/content/experience.json
const experience = defineCollection({
  loader: file('./src/content/experience.json'),
  schema: z.object({
    id: z.string(),
    role: z.string(),
    company: z.string(),
    companyUrl: z.string().url().optional(),
    companyLogo: z.string().optional(),
    companySource: z.string().optional(),
    location: z.string().optional(),
    start: z.string(), // e.g. "Jan 2023"
    end: z.string(), // e.g. "Present"
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, experience };
