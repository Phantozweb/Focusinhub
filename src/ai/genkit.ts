import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyDS8pHSEV556lcX9Mu7EBUdD6Nx6ngRG1E'})],
  model: 'googleai/gemini-2.0-flash',
});
