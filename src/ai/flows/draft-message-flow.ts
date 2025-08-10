'use server';
/**
 * @fileOverview An AI flow for drafting professional messages.
 *
 * - draftMessage - A function that takes a raw message and returns a polished draft.
 * - DraftMessageInput - The input type for the draftMessage function.
 * - DraftMessageOutput - The return type for the draftMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DraftMessageInputSchema = z.object({
  rawMessage: z.string().describe('The raw, informal message from the user.'),
});
export type DraftMessageInput = z.infer<typeof DraftMessageInputSchema>;

const DraftMessageOutputSchema = z.object({
  draft: z.string().describe('The professionally drafted message, ready to be sent.'),
});
export type DraftMessageOutput = z.infer<typeof DraftMessageOutputSchema>;

export async function draftMessage(input: DraftMessageInput): Promise<DraftMessageOutput> {
  return draftMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftMessagePrompt',
  input: {schema: DraftMessageInputSchema},
  output: {schema: DraftMessageOutputSchema},
  prompt: `You are an expert internal communications manager. Your task is to take a raw, informal message and transform it into a professional, clear, and engaging announcement suitable for a company-wide Discord server.

- Keep the tone positive and professional.
- Correct any grammar or spelling mistakes.
- Structure the message for readability (e.g., using bullet points if necessary).
- Do not add any extra information that wasn't in the original message.
- The output should be just the drafted message, without any preamble or extra text.

Raw message:
{{{rawMessage}}}
`,
});

const draftMessageFlow = ai.defineFlow(
  {
    name: 'draftMessageFlow',
    inputSchema: DraftMessageInputSchema,
    outputSchema: DraftMessageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
