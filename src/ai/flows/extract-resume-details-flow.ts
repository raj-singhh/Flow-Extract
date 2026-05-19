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
    email: z.boolean().optional().describe('Whether to extract the primary email address.'),
    phone: z.boolean().optional().describe('Whether to extract the primary phone number.'),
    skills: z.boolean().optional().describe('Whether to extract a concise list of key skills.'),
    experience: z.boolean().optional().describe('Whether to extract a summary of work experience entries.'),
    companies: z.boolean().optional().describe('Whether to extract a list of companies the candidate has worked for.'),
    college: z.boolean().optional().describe('Whether to extract the name of the college or university.'),
    suggestedProfiles: z.boolean().optional().describe('Whether to suggest suitable job profiles based on skills and experience.'),
  }).describe('Configuration for specifying which information fields to extract.'),
});
export type ExtractResumeDetailsInput = z.infer<typeof ExtractResumeDetailsInputSchema>;

const ExtractResumeDetailsOutputSchema = z.object({
  email: z.string().optional().describe('The extracted primary email address.'),
  phone: z.string().optional().describe('The extracted primary phone number.'),
  skills: z.array(z.string()).optional().describe('A list of key technical and soft skills.'),
  experience: z.array(z.string()).optional().describe('A list of summarized work experience entries.'),
  companies: z.array(z.string()).optional().describe('A list of companies.'),
  college: z.string().optional().describe('The name of the college or university.'),
  suggestedProfiles: z.array(z.string()).optional().describe('Suitability profiles.'),
});
export type ExtractResumeDetailsOutput = z.infer<typeof ExtractResumeDetailsOutputSchema>;

export async function extractResumeDetails(input: ExtractResumeDetailsInput): Promise<ExtractResumeDetailsOutput> {
  return extractResumeDetailsFlow(input);
}

const extractResumeDetailsPrompt = ai.definePrompt({
  name: 'extractResumeDetailsPrompt',
  input: { schema: ExtractResumeDetailsInputSchema },
  output: { schema: ExtractResumeDetailsOutputSchema },
  prompt: `You are an expert resume parsing AI. Extract specific information from the provided resume source.
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
{{#if extractConfig.email}}- Extract the primary email address.
{{/if}}{{#if extractConfig.phone}}- Extract the primary phone number.
{{/if}}{{#if extractConfig.skills}}- Extract key skills as an array of strings.
{{/if}}{{#if extractConfig.experience}}- Extract work experience summary as an array of strings.
{{/if}}{{#if extractConfig.companies}}- Extract company history as an array of strings.
{{/if}}{{#if extractConfig.college}}- Extract college/university name.
{{/if}}{{#if extractConfig.suggestedProfiles}}- List all possible job profiles the candidate is suited for as an array of strings.
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
