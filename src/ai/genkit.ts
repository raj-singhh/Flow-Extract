import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Switching to 1.5-flash for higher stability during periods of 2.0/2.5 demand spikes
  model: 'googleai/gemini-1.5-flash',
});
