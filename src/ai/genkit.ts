import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Using gemini-1.5-flash for stability and high rate limits
  model: 'googleai/gemini-1.5-flash',
});
