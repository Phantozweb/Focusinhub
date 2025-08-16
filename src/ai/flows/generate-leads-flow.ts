
'use server';
/**
 * @fileOverview An AI flow for generating enriched leads from a simple contact list.
 *
 * - generateLeads - Takes a list of contacts and returns a list of enriched leads with potential product interest.
 */

import { ai } from '@/ai/genkit';
import { GenerateLeadsInputSchema, GenerateLeadsOutputSchema, GenerateLeadsInput, GenerateLeadsOutput } from './types';


export async function generateLeads(input: GenerateLeadsInput): Promise<GenerateLeadsOutput> {
  return generateLeadsFlow(input);
}

const generateLeadsFlow = ai.defineFlow(
  {
    name: 'generateLeadsFlow',
    inputSchema: GenerateLeadsInputSchema,
    outputSchema: GenerateLeadsOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an expert sales development representative for an optometry technology company called Focus-IN. Your task is to analyze a list of contacts and determine which product each contact would be most interested in.

Our products are:
- Focus AI: Advanced AI-powered diagnostic tools for optometrists.
- Focus Cast: An educational podcast series for optometry professionals and students.
- Focus Case: A platform for managing and sharing interesting patient case studies.
- Focus Clinic: A complete clinic management software suite.

Analyze each contact based on their name, institution, and any other provided details. Based on this information, assign the most relevant product interest. Provide a brief reasoning for your choice. Generate a unique ID for each lead. Carry over all original fields provided.

Contacts list:
{{#each contacts}}
- Name: {{name}}
  Email: {{email}}
  {{#if phone}}Phone: {{phone}}{{/if}}
  {{#if whatsapp}}WhatsApp: {{whatsapp}}{{/if}}
  {{#if institution}}Institution: {{institution}}{{/if}}
  {{#if membership}}Membership: {{membership}}{{/if}}
{{/each}}
`,
      model: ai.model,
      output: {
        schema: GenerateLeadsOutputSchema,
      },
      config: {
        temperature: 0.5,
      },
    });

    return output!;
  }
);
