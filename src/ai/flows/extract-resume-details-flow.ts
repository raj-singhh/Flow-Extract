'use server';
/**
 * @fileOverview A Genkit flow for extracting specific details from resume files or raw text.
 *
 * - extractResumeDetails - A function that handles the resume details extraction process.
 * - ExtractResumeDetailsInput - The input type for the extractResumeDetails function.
 * - ExtractResumeDetailsOutput - The return type for the extractResumeDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractResumeDetailsInputSchema = z.object({
  fileDataUri: z.string().optional().describe("The resume file as a data URI (PDF, Image, or Text)."),
  text: z.string().optional().describe("Raw text content of a resume if pasted directly."),
  extractConfig: z.object({
    email: z.boolean().optional(),
    phone: z.boolean().optional(),
    skills: z.boolean().optional(),
    experience: z.boolean().optional(),
    companies: z.boolean().optional(),
    college: z.boolean().optional(),
    suggestedProfiles: z.boolean().optional(),
    totalExperience: z.boolean().optional().describe('Whether to calculate total years of experience.'),
  }).describe('Configuration for specifying which information fields to extract.'),
});
export type ExtractResumeDetailsInput = z.infer<typeof ExtractResumeDetailsInputSchema>;

const ExtractResumeDetailsOutputSchema = z.object({
  email: z.string().optional().describe('The extracted primary email address.'),
  phone: z.string().optional().describe('The extracted primary phone number.'),
  skills: z.array(z.string()).optional().describe('A comprehensive list of technical and soft skills.'),
  experience: z.array(z.string()).optional().describe('Summarized work experience including role, company, and duration (e.g. "Google - Software Engineer, 3 years").'),
  companies: z.array(z.string()).optional().describe('List of companies worked for.'),
  college: z.string().optional().describe('Full name of the college/university and percentage/GPA if found (e.g., University of Tech - 85% or 3.8 GPA).'),
  suggestedProfiles: z.array(z.string()).optional().describe('Most suitable job profiles based on deep analysis of skills and experience.'),
  totalExperience: z.string().optional().describe('Calculated total years of professional experience (e.g. 5.5 years).'),
});
export type ExtractResumeDetailsOutput = z.infer<typeof ExtractResumeDetailsOutputSchema>;

const extractResumeDetailsPrompt = ai.definePrompt({
  name: 'extractResumeDetailsPrompt',
  input: { schema: ExtractResumeDetailsInputSchema },
  output: { schema: ExtractResumeDetailsOutputSchema },
  prompt: `You are an expert recruitment AI. Extract and analyze candidate information with extreme precision. 

Source Data:
{{#if text}}
RAW TEXT CONTENT:
{{{text}}}
{{/if}}
{{#if fileDataUri}}
FILE CONTENT:
{{media url=fileDataUri}}
{{/if}}

Extraction Requirements:
{{#if extractConfig.email}}- Extract primary email.
{{/if}}{{#if extractConfig.phone}}- Extract primary phone.
{{/if}}{{#if extractConfig.skills}}- Identify all relevant technical skills, tools, and soft skills mentioned. List at least 10 if available.
{{/if}}{{#if extractConfig.experience}}- Summarize work history. For each role, include: Company Name, Job Title, and Duration (e.g. "Google - Software Engineer, 3 years").
{{/if}}{{#if extractConfig.college}}- Identify the college/university name. Crucially, look for and include academic performance metrics like Percentage, CGPA, or GPA if they appear. Format: "Name - Score".
{{/if}}{{#if extractConfig.suggestedProfiles}}- Analyze the entire career trajectory and skill set to suggest at least 3 specific professional profiles the candidate is most qualified for (e.g., "Fullstack Engineer", "Product Manager").
{{/if}}{{#if extractConfig.totalExperience}}- Sum up all professional experiences to provide a total YOE string (e.g., "4.5 years").
{{/if}}`,
});

/**
 * Helper to retry AI calls with exponential backoff for 503 errors.
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.message?.includes('503') || error?.message?.includes('429') || error?.message?.includes('UNAVAILABLE');
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
      throw new Error('Failed to extract resume details after multiple attempts.');
    }
    return response;
  }
);
