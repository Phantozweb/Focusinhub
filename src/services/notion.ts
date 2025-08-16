'use server';
/**
 * @fileoverview Service for interacting with the Notion API.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const taskDatabaseId = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_API_KEY });


export interface NotionTask {
  id: string;
  title: string;
  status: string | null;
  assignee: string | null;
  createdTime: string;
}

// A helper function to get the text from a Notion rich text array.
function getPlainText(richText: any[]): string {
    return richText.map((text) => text.plain_text).join('');
}

// A helper function to get a user's name from a Notion people array.
function getAssignee(people: any[]): string | null {
    if (people.length === 0) {
        return null;
    }
    return people[0]?.name || null;
}

export async function getTasksFromNotion(): Promise<NotionTask[]> {
  if (!taskDatabaseId || !NOTION_API_KEY) {
    throw new Error('Notion database ID or API Key is not configured in the environment.');
  }

  try {
    const response = await notion.databases.query({
      database_id: taskDatabaseId,
    });

    return response.results.map((page) => {
      const anyPage = page as any;
      
      return {
        id: page.id,
        title: anyPage.properties['Task name']?.title ? getPlainText(anyPage.properties['Task name'].title) : 'Untitled',
        status: anyPage.properties.Status?.select?.name || 'No Status',
        assignee: anyPage.properties.Assignee?.people ? getAssignee(anyPage.properties.Assignee.people) : 'Unassigned',
        createdTime: new Date(page.created_time).toLocaleDateString(),
      };
    });
  } catch (error: any) {
      console.error(`Error fetching tasks from Notion: ${error.message}`);
      throw new Error('Failed to fetch tasks from Notion. Please ensure the integration has access to the database.');
  }
}
