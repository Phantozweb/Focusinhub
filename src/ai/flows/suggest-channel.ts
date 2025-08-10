// This file uses server-side code.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting Discord channels based on message content.
 *
 * - suggestChannel - An async function that takes message content as input and returns a suggestion for Discord channels.
 * - SuggestChannelInput - The input type for the suggestChannel function, defining the message content.
 * - SuggestChannelOutput - The output type for the suggestChannel function, providing a list of suggested Discord channels.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestChannelInputSchema = z.object({
  messageContent: z
    .string() 
    .describe('The content of the message for which to suggest Discord channels.'),
});
export type SuggestChannelInput = z.infer<typeof SuggestChannelInputSchema>;

const SuggestChannelOutputSchema = z.object({
  suggestedChannels: z
    .array(z.string())
    .describe('An array of suggested Discord channel names.'),
});
export type SuggestChannelOutput = z.infer<typeof SuggestChannelOutputSchema>;

export async function suggestChannel(input: SuggestChannelInput): Promise<SuggestChannelOutput> {
  return suggestChannelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestChannelPrompt',
  input: {schema: SuggestChannelInputSchema},
  output: {schema: SuggestChannelOutputSchema},
  prompt: `Given the following message content, suggest the most appropriate Discord channels from the list below. Only suggest channels from the pre-defined list and only respond with channel names.

Message Content: {{{messageContent}}}

Available Discord Channels:
- company-announcements
- strategy-room
- all-hands
- policies
- industry-news
- project-roadmap
- daily-updates
- task-board
- meeting-notes
- milestones
- focus-ai-dev
- focus-cast-audio
- focus-axis-simulator
- beta-testing
- bug-tracking
- feature-planning
- integration-requests
- content-calendar
- design-assets
- campaign-tracking
- prebook-campaign
- partnerships
- social-media-posts
- client-onboarding
- active-clients
- support-tickets
- success-stories
- team-intros
- wins
- casual-chat
- learning-lounge
- feedback-loop
- internship-planning
- applications-review
- training-plans
- intern-progress
- mentor-discussions
- final-reports`,
});

const suggestChannelFlow = ai.defineFlow(
  {
    name: 'suggestChannelFlow',
    inputSchema: SuggestChannelInputSchema,
    outputSchema: SuggestChannelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
