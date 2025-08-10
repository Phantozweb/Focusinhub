'use server';

/**
 * @fileOverview An AI agent that adjusts the tone of a message.
 *
 * - adjustTone - A function that adjusts the tone of a message.
 * - AdjustToneInput - The input type for the adjustTone function.
 * - AdjustToneOutput - The return type for the adjustTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustToneInputSchema = z.object({
  message: z.string().describe('The message to adjust the tone of.'),
  tone: z
    .enum(['Formal', 'Standard', 'Celebratory'])
    .describe('The desired tone of the message.'),
});
export type AdjustToneInput = z.infer<typeof AdjustToneInputSchema>;

const AdjustToneOutputSchema = z.object({
  adjustedMessage: z.string().describe('The message with the adjusted tone.'),
});
export type AdjustToneOutput = z.infer<typeof AdjustToneOutputSchema>;

export async function adjustTone(input: AdjustToneInput): Promise<AdjustToneOutput> {
  return adjustToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustTonePrompt',
  input: {schema: AdjustToneInputSchema},
  output: {schema: AdjustToneOutputSchema},
  prompt: `You are an expert at adjusting the tone of messages.

  A user will provide you with a message and a desired tone. You will rephrase the message to match the tone.

  Message: {{{message}}}
  Tone: {{{tone}}}

  Adjusted Message:`, // No need to be explicit about the output format since `outputSchema` drives it.
});

const adjustToneFlow = ai.defineFlow(
  {
    name: 'adjustToneFlow',
    inputSchema: AdjustToneInputSchema,
    outputSchema: AdjustToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      adjustedMessage: output!.adjustedMessage,
    };
  }
);
