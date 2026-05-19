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
  experience: z.array(z.string()).optional().describe('Summarized work experience including role and duration.'),
  companies: z.array(z.string()).optional().describe('List of companies worked for.'),
  college: z.string().optional().describe('Full name of the college/university and percentage/GPA if found (e.g., University of Tech - 85%).'),
  suggestedProfiles: z.array(z.string()).optional().describe('Most suitable job profiles based on deep analysis.'),
  totalExperience: z.string().optional().describe('Calculated total years of experience (e.g. 5.5 years).'),
});
export type ExtractResumeDetailsOutput = z.infer<typeof ExtractResumeDetailsOutputSchema>;

export async function extractResumeDetails(input: ExtractResumeDetailsInput): Promise<ExtractResumeDetailsOutput> {
  return extractResumeDetailsFlow(input);
}

const extractResumeDetailsPrompt = ai.definePrompt({
  name: 'extractResumeDetailsPrompt',
  input: { schema: ExtractResumeDetailsInputSchema },
  output: { schema: ExtractResumeDetailsOutputSchema },
  prompt: `You are an expert recruitment AI. Extract and analyze candidate information with high precision.
Respond STRICTLY in JSON format.

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
{{/if}}{{#if extractConfig.skills}}- Identify all relevant technical skills and soft skills.
{{/if}}{{#if extractConfig.experience}}- Summarize key roles with company names and time periods.
{{/if}}{{#if extractConfig.college}}- Find the full college name and any mentioned CGPA/Percentage/GPA.
{{/if}}{{#if extractConfig.suggestedProfiles}}- Suggest specific job titles or roles the candidate is highly qualified for.
{{/if}}{{#if extractConfig.totalExperience}}- Calculate the total duration of the professional career in years (e.g., "4 years 2 months" or "8 years").
{{/if}}`,
});

const extractResumeDetailsFlow = ai.defineFlow(
  {
    name: 'extractResumeDetailsFlow',
    inputSchema: ExtractResumeDetailsInputSchema,
    outputSchema: ExtractResumeDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await extractResumeDetailsPrompt(input);
    if (!output) {
      throw new Error('Failed to extract resume details.');
    }
    return output;
  }
);
