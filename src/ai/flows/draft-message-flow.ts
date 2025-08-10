'use server';
/**
 * @fileOverview An AI flow for drafting professional messages.
 *
 * - draftMessage - A function that takes a raw message and returns a polished draft and a catchy title.
 * - DraftMessageInput - The input type for the draftMessage function.
 * - DraftMessageOutput - The return type for the draftMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DraftMessageInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history between the user and the AI. The AI\'s responses will be a JSON string of the DraftMessageOutput schema.'),
  initialMessage: z.string().optional().describe('The very first message from the user to start the draft.'),
});
export type DraftMessageInput = z.infer<typeof DraftMessageInputSchema>;

const DraftMessageOutputSchema = z.object({
  title: z.string().describe('A short, catchy, and professional title for the announcement.'),
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
  prompt: `You are an expert internal communications manager acting as a conversational AI assistant. Your task is to help a user draft a professional, clear, and engaging announcement for a company-wide Discord server based on a conversation with them.

- Your first response should be a polished draft and a catchy title based on the user's initial raw message.
- For subsequent turns, you will refine the draft and title based on the user's feedback. Read the entire history to understand the context. The user is in charge.
- Always create a short, catchy, and professional title for the announcement.
- Keep the message tone positive and professional.
- Correct any grammar or spelling mistakes.
- Structure the message for readability (e.g., using bullet points if necessary).
- Do not add any extra information that wasn't in the original message unless requested.
- If the user asks for variations, provide them. For example, if they say "make it more casual", you should rephrase the existing draft.
- Your final output for each turn must be a complete, updated draft and title, not just the changes. The output must be a valid JSON object matching the requested schema.

{{#if initialMessage}}
Initial raw message:
{{{initialMessage}}}
{{/if}}

Conversation History:
{{#each history}}
{{#if (eq role "user")}}
User: {{{content}}}
{{else}}
AI: (Responded with a draft: {{{content}}})
{{/if}}
{{/each}}
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
