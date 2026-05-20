'use server';
/**
 * @fileOverview High-precision resume extraction using Groq (llama-3.3-70b-versatile).
 * PDFs are parsed server-side with pdf-parse. Images use Gemini vision as fallback.
 * Groq free tier: 14,400 req/day, 500,000 tokens/min — very generous.
 */

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod';
import { ExtractionConfig } from '@/components/ExtractionConfigBar';

// ── Groq client ───────────────────────────────────────────────────────────────
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────────────
export type ExtractResumeDetailsInput = {
  fileDataUri?: string;
  text?: string;
  extractConfig: Partial<ExtractionConfig>;
};

const OutputSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  college: z.string().optional(),
  suggestedProfiles: z.array(z.string()).optional(),
  totalExperience: z.string().optional(),
});

export type ExtractResumeDetailsOutput = z.infer<typeof OutputSchema>;

// ── PDF text extractor ────────────────────────────────────────────────────────
async function extractTextFromDataUri(dataUri: string): Promise<string> {
  const [header, base64Data] = dataUri.split(',');
  const mimeType = header.replace('data:', '').replace(';base64', '');
  const buffer = Buffer.from(base64Data, 'base64');

  if (mimeType === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  // For images (jpg, png, webp) — return a marker; caller handles it
  return `__IMAGE__:${dataUri}`;
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(resumeText: string, cfg: Partial<ExtractionConfig>): string {
  const fields = [
    '"name": full name of the candidate (always extract)',
    cfg.email && '"email": email address exactly as written',
    cfg.phone && '"phone": phone/mobile number including country code if present',
    cfg.skills && '"skills": array of ALL skills — every programming language, framework, library, database, cloud platform, tool, methodology, soft skill, and certification mentioned anywhere in the resume including project descriptions. Be exhaustive.',
    cfg.experience && '"experience": array of strings, one per role, format: "Company Name - Job Title | Month Year - Month Year (~X.X yrs)". Use "Present" if still employed. Include internships.',
    cfg.companies && '"companies": array of all company/organization names',
    cfg.college && '"college": string with full institution name, degree, branch, and score. Format: "Institution | Degree, Branch | Score". Multiple degrees separated by semicolons. Example: "IIT Bombay | B.Tech, CS | CGPA: 8.7/10"',
    cfg.suggestedProfiles && '"suggestedProfiles": array of 3-6 specific professional role titles this candidate best fits. Be specific e.g. "Senior React Developer" not just "Developer"',
    cfg.totalExperience && '"totalExperience": string, sum of all professional work durations as decimal years e.g. "4.5 years"',
  ]
    .filter(Boolean)
    .join('\n- ');

  return `You are an expert Recruitment Data Scientist. Extract candidate information from the resume below and return ONLY a valid JSON object with these fields:
- ${fields}

RESUME CONTENT:
${resumeText}

STRICT RULES:
1. Return ONLY a raw JSON object. No markdown, no code blocks, no explanation.
2. Extract ONLY what is explicitly present. Never fabricate.
3. For skills: scan the entire document including project sections and descriptions.
4. For experience: calculate duration precisely from the dates given.
5. For college: include percentage OR CGPA/GPA exactly as written.
6. Omit any field where the information is genuinely not present (do not include the key).

Return the JSON object now:`;
}

// ── Safe JSON parser ──────────────────────────────────────────────────────────
function parseJsonResponse(raw: string): ExtractResumeDetailsOutput {
  // Strip markdown code fences if the model wraps in them anyway
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Validate through zod — strips unknown keys, coerces types
    const result = OutputSchema.safeParse(parsed);
    return result.success ? result.data : parsed;
  } catch {
    // Last resort: try to extract a JSON object from anywhere in the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // ignore
      }
    }
    console.error('Failed to parse JSON from model response:', cleaned.slice(0, 300));
    return {};
  }
}

// ── Retry with backoff ────────────────────────────────────────────────────────
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const msg = (error?.message || '').toLowerCase();
    const isRetryable =
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('rate_limit') ||
      msg.includes('overloaded') ||
      msg.includes('resource_exhausted');

    if (retries > 0 && isRetryable) {
      console.log(`Groq rate limited, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ── Image fallback via Gemini vision ─────────────────────────────────────────
async function extractFromImageWithGemini(
  dataUri: string,
  cfg: Partial<ExtractionConfig>
): Promise<ExtractResumeDetailsOutput> {
  const { ai } = await import('@/ai/genkit');
  const { z: zGenkit } = await import('genkit');

  const GeminiOutputSchema = zGenkit.object({
    name: zGenkit.string().optional(),
    email: zGenkit.string().optional(),
    phone: zGenkit.string().optional(),
    skills: zGenkit.array(zGenkit.string()).optional(),
    experience: zGenkit.array(zGenkit.string()).optional(),
    companies: zGenkit.array(zGenkit.string()).optional(),
    college: zGenkit.string().optional(),
    suggestedProfiles: zGenkit.array(zGenkit.string()).optional(),
    totalExperience: zGenkit.string().optional(),
  });

  const prompt = ai.definePrompt({
    name: `imageResumeExtract_${Date.now()}`,
    input: { schema: zGenkit.object({ fileDataUri: zGenkit.string(), config: zGenkit.any() }) },
    output: { schema: GeminiOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `Extract resume data from this image. Return: name, email, phone, skills (all of them), experience (each as "Company - Title | Dates (~X yrs)"), companies, college (with score), suggestedProfiles (3-6 specific titles), totalExperience.
{{media url=fileDataUri}}`,
  });

  const { output } = await prompt({ fileDataUri: dataUri, config: cfg });
  return output ?? {};
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function extractResumeDetails(
  input: ExtractResumeDetailsInput
): Promise<ExtractResumeDetailsOutput> {
  let resumeText = input.text ?? '';

  // If a file was provided, extract its text first
  if (input.fileDataUri && !resumeText) {
    const extracted = await extractTextFromDataUri(input.fileDataUri);

    // Image file — use Gemini vision as fallback
    if (extracted.startsWith('__IMAGE__:')) {
      return retryWithBackoff(() =>
        extractFromImageWithGemini(input.fileDataUri!, input.extractConfig)
      );
    }

    resumeText = extracted;
  }

  if (!resumeText.trim()) {
    throw new Error('No resume content could be extracted from the provided input.');
  }

  return retryWithBackoff(async () => {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: buildPrompt(resumeText, input.extractConfig),
      temperature: 0.1,
    });
    return parseJsonResponse(text);
  });
}
