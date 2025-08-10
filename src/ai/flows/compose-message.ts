'use server';

/**
 * @fileOverview An AI agent that composes well-structured messages from rough drafts or bullet points.
 *
 * - composeMessage - A function that handles the message composition process.
 * - ComposeMessageInput - The input type for the composeMessage function.
 * - ComposeMessageOutput - The return type for the composeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComposeMessageInputSchema = z.object({
  input: z
    .string()
    .describe('The rough draft or bullet points to be expanded into a well-structured message.'),
});
export type ComposeMessageInput = z.infer<typeof ComposeMessageInputSchema>;

const ComposeMessageOutputSchema = z.object({
  message: z.string().describe('The well-structured message composed by the AI.'),
});
export type ComposeMessageOutput = z.infer<typeof ComposeMessageOutputSchema>;

export async function composeMessage(input: ComposeMessageInput): Promise<ComposeMessageOutput> {
  return composeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeMessagePrompt',
  input: {schema: ComposeMessageInputSchema},
  output: {schema: ComposeMessageOutputSchema},
  prompt: `You are an expert communication assistant. Your task is to take the user's rough draft or bullet points and expand it into a well-structured message.

Input: {{{input}}}

Compose a well-structured message from the input above:
`,
});

const composeMessageFlow = ai.defineFlow(
  {
    name: 'composeMessageFlow',
    inputSchema: ComposeMessageInputSchema,
    outputSchema: ComposeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
