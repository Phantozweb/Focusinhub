import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/compose-message.ts';
import '@/ai/flows/adjust-tone.ts';
import '@/ai/flows/suggest-channel.ts';