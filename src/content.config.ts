import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const FIELDS = ['hardware', 'software', 'electronics'] as const;
export const TOPICS = [
  'kinematics',
  'navigation',
  'slam',
  'computer-vision',
  'motion-planning',
  'controls',
  'ai-ml',
] as const;
export const STATUSES = ['done', 'ongoing', 'planned'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    fields: z.array(z.enum(FIELDS)).min(1),
    topics: z.array(z.enum(TOPICS)).default([]), // shown as hashtags, not filters
    status: z.enum(STATUSES),
    draft: z.boolean().default(false), // greyed out with no page until written up
    course: z.string().optional(),
    links: z
      .object({ github: z.string().optional(), video: z.string().optional(), other: z.string().optional() })
      .optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, notes };
