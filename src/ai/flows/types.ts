/**
 * @fileOverview Type definitions and Zod schemas for AI flows.
 */

import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().describe('Full name of the contact.'),
  email: z.string().email().describe('Email address of the contact.'),
  phone: z.string().optional().describe('Phone number of the contact.'),
  institution: z.string().optional().describe('The company, university, or organization the contact is affiliated with.'),
});

export const GenerateLeadsInputSchema = z.object({
  contacts: z.array(ContactSchema).describe('An array of contacts to be enriched into leads.'),
});
export type GenerateLeadsInput = z.infer<typeof GenerateLeadsInputSchema>;

const LeadSchema = z.object({
    id: z.string().describe('A unique identifier for the lead.'),
    name: z.string().describe('Full name of the lead.'),
    email: z.string().email().describe('Email address of the lead.'),
    phone: z.string().optional().describe('Phone number of the lead.'),
    institution: z.string().optional().describe('The organization the lead belongs to.'),
    productInterest: z.enum(['Focus AI', 'Focus Cast', 'Focus Case', 'Focus Clinic']).describe('The product the AI believes this lead would be most interested in.'),
    reasoning: z.string().describe('A brief explanation for why the AI suggested this product interest.'),
});

export const GenerateLeadsOutputSchema = z.array(LeadSchema);
export type GenerateLeadsOutput = z.infer<typeof GenerateLeadsOutputSchema>;
