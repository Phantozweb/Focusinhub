
'use server';
/**
 * @fileoverview Service for interacting with the Notion API.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const taskDatabaseId = process.env.NOTION_DATABASE_ID;
const biometricsDatabaseId = process.env.NOTION_BIOMETRICS_DATABASE_ID;

const notion = new Client({ auth: NOTION_API_KEY });


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

export async function checkInUser(name: string, status: 'Work' | 'Visit'): Promise<string> {
    if (!biometricsDatabaseId || !NOTION_API_KEY) {
        throw new Error('Notion API Key or Biometrics Database ID is not configured in the environment.');
    }
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
        const response = await notion.pages.create({
            parent: { database_id: biometricsDatabaseId },
            properties: {
                'Name': { title: [{ text: { content: name } }] },
                'Date': { date: { start: formattedDate } },
                'Log in': { rich_text: [{ text: { content: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) } }] },
                'Status': { select: { name: status } },
            },
        });
        return response.id;
    } catch (error: any) {
        console.error(`Error checking in user with Notion: ${error.message}`);
        throw new Error('Failed to create session in Notion. Please ensure the integration has permissions for the biometrics database.');
    }
}

export async function checkOutUser(pageId: string, checkInTime: string, notes: string): Promise<void> {
    if (!NOTION_API_KEY) {
        throw new Error('Notion API Key is not configured in the environment.');
    }

    try {
        const checkOutTime = new Date();
        const checkOutText = checkOutTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

        let totalHoursText: string | null = null;
        try {
            const checkInDate = new Date(checkInTime);
            const diffMs = checkOutTime.getTime() - checkInDate.getTime();
            const diffSec = Math.max(0, Math.floor(diffMs / 1000));
            const diffMins = Math.floor(diffSec / 60);
            const diffHours = Math.floor(diffMins / 60);

            const hours = diffHours;
            const minutes = diffMins % 60;
            const seconds = diffSec % 60;
            
            if (hours > 0) {
                totalHoursText = `${hours} hr ${minutes} min`;
            } else if (minutes > 0) {
                totalHoursText = `${minutes} min ${seconds} sec`;
            } else {
                totalHoursText = `${seconds} sec`;
            }
        } catch (e) {
            console.error("Could not calculate total work duration from check-in time:", e);
            totalHoursText = "Error";
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
    } catch (error: any) {
        console.error(`Error checking out user with Notion: ${error.message}`);
        throw new Error('Failed to update session in Notion. Please check API permissions.');
    }
}

export async function getBiometricData(): Promise<BiometricRecord[]> {
    if (!biometricsDatabaseId || !NOTION_API_KEY) {
        throw new Error('Notion API Key or Biometrics Database ID is not configured in the environment.');
    }
    
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    try {
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
    } catch (error: any) {
        console.error(`Error fetching biometric data from Notion: ${error.message}`);
        throw new Error('Failed to fetch biometric data. Please ensure the integration has access to the database.');
    }
}
