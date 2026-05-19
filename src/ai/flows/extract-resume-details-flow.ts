'use server';
/**
 * @fileOverview High-precision extraction flow for candidate resumes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractResumeDetailsInputSchema = z.object({
  fileDataUri: z.string().optional().describe("The resume file as a data URI."),
  text: z.string().optional().describe("Raw text content of a resume."),
  extractConfig: z.object({
    email: z.boolean().optional(),
    phone: z.boolean().optional(),
    skills: z.boolean().optional(),
    experience: z.boolean().optional(),
    companies: z.boolean().optional(),
    college: z.boolean().optional(),
    suggestedProfiles: z.boolean().optional(),
    totalExperience: z.boolean().optional(),
  }),
});
export type ExtractResumeDetailsInput = z.infer<typeof ExtractResumeDetailsInputSchema>;

const ExtractResumeDetailsOutputSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional().describe('Format: "Company - Role, Duration"'),
  companies: z.array(z.string()).optional(),
  college: z.string().optional().describe('Format: "College Name - Score/Percentage"'),
  suggestedProfiles: z.array(z.string()).optional(),
  totalExperience: z.string().optional().describe('Format: "X.X years"'),
});
export type ExtractResumeDetailsOutput = z.infer<typeof ExtractResumeDetailsOutputSchema>;

const extractResumeDetailsPrompt = ai.definePrompt({
  name: 'extractResumeDetailsPrompt',
  input: { schema: ExtractResumeDetailsInputSchema },
  output: { schema: ExtractResumeDetailsOutputSchema },
  prompt: `You are an expert recruitment AI. Extract and analyze candidate information with extreme precision.

Source Data:
{{#if text}}
RAW TEXT:
{{{text}}}
{{/if}}
{{#if fileDataUri}}
FILE:
{{media url=fileDataUri}}
{{/if}}

Requirements:
- Extract academic percentage or GPA with the college name.
- Calculate total professional experience (YOE) as a single number string (e.g. "5.2 years").
- List experience as "Company - Role, Duration".
- Suggest 3+ professional job profiles based on skills.
- Identify all technical and soft skills.`,
});

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.message?.includes('503') || error?.message?.includes('429');
    if (retries > 0 && isRetryable) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function extractResumeDetails(input: ExtractResumeDetailsInput): Promise<ExtractResumeDetailsOutput> {
  return extractResumeDetailsFlow(input);
}

const extractResumeDetailsFlow = ai.defineFlow(
  {
    name: 'extractResumeDetailsFlow',
    inputSchema: ExtractResumeDetailsInputSchema,
    outputSchema: ExtractResumeDetailsOutputSchema,
  },
  async (input) => {
    const response = await retryWithBackoff(async () => {
      const { output } = await extractResumeDetailsPrompt(input);
      return output;
    });

    if (!response) {
      throw new Error('Service currently unavailable. Please try again in a moment.');
    }
    return response;
  }
);
