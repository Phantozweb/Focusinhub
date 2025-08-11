'use server';
/**
 * @fileoverview Service for interacting with the Notion API.
 */

import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID!;

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
  if (!databaseId) {
    throw new Error('Notion database ID is not configured.');
  }

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  return response.results.map((page) => {
    // We need to cast the page to any to access the properties
    const anyPage = page as any;
    
    return {
      id: page.id,
      title: anyPage.properties['Task name']?.title ? getPlainText(anyPage.properties['Task name'].title) : 'Untitled',
      status: anyPage.properties.Status?.select?.name || 'No Status',
      assignee: anyPage.properties.Assignee?.people ? getAssignee(anyPage.properties.Assignee.people) : 'Unassigned',
      createdTime: new Date(page.created_time).toLocaleDateString(),
    };
  });
}
