import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Using gemini-1.5-flash for higher rate limits and stability
  model: 'googleai/gemini-1.5-flash',
});
