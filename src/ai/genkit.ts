import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use the standard identifier for Gemini 1.5 Flash
  model: 'googleai/gemini-1.5-flash',
});
