'use server';
/**
 * @fileoverview Service for interacting with the Notion API.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_BIOMETRICS_DATABASE_ID = process.env.NOTION_BIOMETRICS_DATABASE_ID;


const notion = new Client({ auth: NOTION_API_KEY });
const taskDatabaseId = NOTION_DATABASE_ID;
const biometricsDatabaseId = NOTION_BIOMETRICS_DATABASE_ID;

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
  totalHours: string | null;
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
    if (!biometricsDatabaseId || !NOTION_API_KEY) {
        throw new Error('Notion API Key or Biometrics Database ID is not configured.');
    }
    const now = new Date();
    const response = await notion.pages.create({
        parent: { database_id: biometricsDatabaseId },
        properties: {
            'Name': { title: [{ text: { content: name } }] },
            'Date': { date: { start: now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) } },
            'Log in': { rich_text: [{ text: { content: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) } }] },
            'Status': { select: { name: status } },
        },
    });
    return response.id;
}

export async function checkOutUser(pageId: string, notes: string): Promise<void> {
    if (!biometricsDatabaseId || !NOTION_API_KEY) {
        throw new Error('Notion API Key or Biometrics Database ID is not configured.');
    }

    // First, fetch the page to get the 'Log in' time
    const pageResponse = await notion.pages.retrieve({ page_id: pageId });
    const anyPage = pageResponse as any;
    const checkInText = anyPage.properties['Log in']?.rich_text ? getPlainText(anyPage.properties['Log in'].rich_text) : null;
    const checkOutTime = new Date();
    const checkOutText = checkOutTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

    let totalHoursText = null;

    if (checkInText) {
        try {
            // Parse check-in time (e.g., "10:00 AM")
            const [time, modifier] = checkInText.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier.toLowerCase() === 'pm' && hours < 12) {
                hours += 12;
            }
            if (modifier.toLowerCase() === 'am' && hours === 12) {
                hours = 0;
            }
            const checkInDate = new Date();
            checkInDate.setHours(hours, minutes, 0, 0);

            // Calculate duration
            const diffMs = checkOutTime.getTime() - checkInDate.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSec / 60);
            const diffHours = Math.floor(diffMins / 60);

            if (diffHours > 0) {
                totalHoursText = `${diffHours} hr ${diffMins % 60} min`;
            } else if (diffMins > 0) {
                totalHoursText = `${diffMins} min ${diffSec % 60} sec`;
            } else {
                totalHoursText = `${diffSec} sec`;
            }

        } catch (e) {
            console.error("Could not calculate total hours", e);
            totalHoursText = "Error";
        }
    }


    await notion.pages.update({
        page_id: pageId,
        properties: {
            'Log out': { rich_text: [{ text: { content: checkOutText } }] },
            'Notes': { rich_text: [{ text: { content: notes } }] },
            'Status': { select: { name: 'Offline' } },
            'Total hours': { rich_text: [{ text: { content: totalHoursText || 'N/A' } }]},
        },
    });
}

export async function getBiometricData(): Promise<BiometricRecord[]> {
    if (!biometricsDatabaseId || !NOTION_API_KEY) {
        throw new Error('Notion API Key or Biometrics Database ID is not configured.');
    }
    
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const response = await notion.databases.query({
        database_id: biometricsDatabaseId,
        filter: {
            property: 'Date',
            date: {
                on_or_after: today,
            },
        },
        sorts: [{
            timestamp: 'created_time',
            direction: 'descending'
        }]
    });

    return response.results.map((page) => {
        const anyPage = page as any;
        const checkInText = anyPage.properties['Log in']?.rich_text ? getPlainText(anyPage.properties['Log in'].rich_text) : null;
        const checkOutText = anyPage.properties['Log out']?.rich_text ? getPlainText(anyPage.properties['Log out'].rich_text) : null;
        const totalHours = anyPage.properties['Total hours']?.rich_text ? getPlainText(anyPage.properties['Total hours'].rich_text) : null;

        const onlineStatus = anyPage.properties.Status?.select?.name;
        const currentStatus = checkOutText ? 'Offline' : onlineStatus;

        return {
            id: page.id,
            name: anyPage.properties.Name?.title ? getPlainText(anyPage.properties.Name.title) : 'Unnamed',
            checkIn: checkInText,
            checkOut: checkOutText,
            status: currentStatus,
            notes: anyPage.properties.Notes?.rich_text ? getPlainText(anyPage.properties.Notes.rich_text) : null,
            totalHours: totalHours,
        };
    });
}
