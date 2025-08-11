'use server';
/**
 * @fileOverview A Genkit flow for fetching tasks from Notion.
 */

import { ai } from '@/ai/genkit';
import { getTasksFromNotion, NotionTask } from '@/services/notion';
import { z } from 'zod';

const GetNotionTasksOutputSchema = z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string().nullable(),
    assignee: z.string().nullable(),
    createdTime: z.string(),
}));
export type GetNotionTasksOutput = z.infer<typeof GetNotionTasksOutputSchema>;


export async function getNotionTasks(): Promise<GetNotionTasksOutput> {
    return getNotionTasksFlow();
}

const getNotionTasksFlow = ai.defineFlow(
  {
    name: 'getNotionTasksFlow',
    outputSchema: GetNotionTasksOutputSchema,
  },
  async () => {
    return await getTasksFromNotion();
  }
);
