'use server';
/**
 * @fileOverview High-precision extraction flow for candidate resumes.
 * This flow extracts detailed academic and professional data with extreme accuracy.
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
  college: z.string().optional().describe('Format: "Full College Name - Percentage/GPA/Score"'),
  suggestedProfiles: z.array(z.string()).optional().describe('List of 3+ highly specific professional titles.'),
  totalExperience: z.string().optional().describe('Format: "X.X years"'),
});
export type ExtractResumeDetailsOutput = z.infer<typeof ExtractResumeDetailsOutputSchema>;

const extractResumeDetailsPrompt = ai.definePrompt({
  name: 'extractResumeDetailsPrompt',
  input: { schema: ExtractResumeDetailsInputSchema },
  output: { schema: ExtractResumeDetailsOutputSchema },
  // Explicitly set model to avoid 404 issues with global defaults
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an elite Recruitment Data Scientist. Your task is to extract candidate information with 100% precision from the provided resume source.

Source Data:
{{#if text}}
RAW TEXT CONTENT:
{{{text}}}
{{/if}}
{{#if fileDataUri}}
RESUME FILE (IMAGE/PDF):
{{media url=fileDataUri}}
{{/if}}

STRICT EXTRACTION RULES:
1. COLLEGE & SCORE: Find the full, official name of the university/college. Identify the final academic score (Percentage, CGPA, or GPA). Combine as "College Name - Score".
2. TOTAL EXPERIENCE (YOE): Analyze the work history dates. Calculate the total aggregate professional experience and express it as a decimal string followed by "years" (e.g., "4.5 years").
3. WORK HISTORY: List experience as "Company Name - Role Title, Duration". Be very specific about company names.
4. SKILLS: Identify all technical stacks, soft skills, and certifications. Be exhaustive but accurate.
5. SUGGESTED PROFILES: Based on the candidate's deep skill set and experience level, suggest the 3-5 most appropriate professional roles (e.g., "Senior Fullstack Engineer", "Product Lead").

Be precise. If information is missing, leave the field blank.`,
});

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    const isRetryable = errorMsg.includes('503') || errorMsg.includes('429') || errorMsg.includes('Service Unavailable');
    
    if (retries > 0 && isRetryable) {
      console.log(`AI busy, retrying in ${delay}ms... (${retries} retries left)`);
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
      throw new Error('Service currently unavailable. Please try again later.');
    }
    return response;
  }
);
