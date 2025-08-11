'use server';
/**
 * @fileoverview Service for interacting with the Notion API.
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const taskDatabaseId = process.env.NOTION_DATABASE_ID!;
const biometricsDatabaseId = process.env.NOTION_BIOMETRICS_DATABASE_ID!;

export interface NotionTask {
  id: string;
  title: string;
  status: string | null;
  assignee: string | null;
  createdTime: string;
}

export interface BiometricRecord {
  id: string;
  name: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string | null;
  notes: string | null;
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
  if (!taskDatabaseId) {
    throw new Error('Notion database ID is not configured.');
  }

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
}

export async function checkInUser(name: string, status: 'Work' | 'Visit'): Promise<string> {
    if (!biometricsDatabaseId) {
        throw new Error('Notion biometrics database ID is not configured.');
    }
    const now = new Date().toISOString();
    const response = await notion.pages.create({
        parent: { database_id: biometricsDatabaseId },
        properties: {
            'Name': { rich_text: [{ text: { content: name } }] },
            'Date': { date: { start: now.split('T')[0] } },
            'Log in': { date: { start: now } },
            'Status': { select: { name: status } },
        },
    });
    return response.id;
}

export async function checkOutUser(pageId: string, notes: string): Promise<void> {
    if (!biometricsDatabaseId) {
        throw new Error('Notion biometrics database ID is not configured.');
    }
    await notion.pages.update({
        page_id: pageId,
        properties: {
            'Log out': { date: { start: new Date().toISOString() } },
            'Notes': { rich_text: [{ text: { content: notes } }] },
            'Status': { select: { name: 'Offline' } },
        },
    });
}

export async function getBiometricData(): Promise<BiometricRecord[]> {
    if (!biometricsDatabaseId) {
        throw new Error('Notion biometrics database ID is not configured.');
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const response = await notion.databases.query({
        database_id: biometricsDatabaseId,
        filter: {
            property: 'Date',
            date: {
                on_or_after: today.toISOString().split('T')[0],
            },
        },
        sorts: [{
            property: 'Log in',
            direction: 'descending'
        }]
    });

    return response.results.map((page) => {
        const anyPage = page as any;
        const checkInDate = anyPage.properties['Log in']?.date?.start;
        const checkOutDate = anyPage.properties['Log out']?.date?.start;

        const onlineStatus = anyPage.properties.Status?.select?.name;
        const currentStatus = checkOutDate ? 'Offline' : onlineStatus;

        return {
            id: page.id,
            name: anyPage.properties.Name?.title ? getPlainText(anyPage.properties.Name.title) : (anyPage.properties.Name?.rich_text ? getPlainText(anyPage.properties.Name.rich_text) : 'Unnamed'),
            checkIn: checkInDate ? new Date(checkInDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            checkOut: checkOutDate ? new Date(checkOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            status: currentStatus,
            notes: anyPage.properties.Notes?.rich_text ? getPlainText(anyPage.properties.Notes.rich_text) : null,
        };
    });
}
