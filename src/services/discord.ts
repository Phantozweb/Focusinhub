'use server';

/**
 * @fileoverview Service for sending notifications to Discord webhooks.
 */

const CHECK_IN_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL_CHECK_IN;
const CHECK_OUT_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL_CHECK_OUT;
const SUMMARY_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL_SUMMARY;

function getUserDisplayName(username: string): string {
    if (username === 'Jana@Ceo') return 'Janarthan (Founder & CEO)';
    if (username === 'Hariharan@Focusin01') return 'Hariharan';
    return username;
}

async function sendDiscordWebhook(url: string, payload: object) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord webhook failed with status ${response.status}: ${errorText}`);
    }
}

export async function sendCheckInNotification(username: string, checkInTime: string) {
    if (!CHECK_IN_WEBHOOK_URL) {
        console.warn('Check-in webhook URL is not configured. Skipping notification.');
        return;
    }

    const timestamp = Math.floor(new Date(checkInTime).getTime() / 1000);
    const displayName = getUserDisplayName(username);

    const payload = {
        embeds: [{
            title: '✅ User Check-In',
            description: `**${displayName}** has logged in.`,
            color: 3066993, // Green
            fields: [
                {
                    name: '⏰ Check-In Time',
                    value: `<t:${timestamp}:F>`,
                    inline: false,
                },
            ],
            timestamp: new Date().toISOString(),
        }],
    };

    await sendDiscordWebhook(CHECK_IN_WEBHOOK_URL, payload);
}

export async function sendCheckOutNotification(username: string, checkOutTime: string) {
    if (!CHECK_OUT_WEBHOOK_URL) {
        console.warn('Check-out webhook URL is not configured. Skipping notification.');
        return;
    }
    
    const timestamp = Math.floor(new Date(checkOutTime).getTime() / 1000);
    const displayName = getUserDisplayName(username);

    const payload = {
        embeds: [{
            title: '❌ User Check-Out',
            description: `**${displayName}** has logged out.`,
            color: 15158332, // Red
            fields: [
                 {
                    name: '⏰ Check-Out Time',
                    value: `<t:${timestamp}:F>`,
                    inline: false,
                },
            ],
            timestamp: new Date().toISOString(),
        }],
    };
    
    await sendDiscordWebhook(CHECK_OUT_WEBHOOK_URL, payload);
}


export async function sendWorkSummaryNotification(username: string, checkInTime: string, checkOutTime: string, workSummary: string) {
    if (!SUMMARY_WEBHOOK_URL) {
        console.warn('Summary webhook URL is not configured. Skipping notification.');
        return;
    }

    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);
    
    const durationMs = checkOutDate.getTime() - checkInDate.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const totalHours = `${hours} hours and ${minutes} minutes`;

    const checkInTimestamp = Math.floor(checkInDate.getTime() / 1000);
    const checkOutTimestamp = Math.floor(checkOutDate.getTime() / 1000);
    const displayName = getUserDisplayName(username);

    const payload = {
        embeds: [{
            title: '📝 Daily Work Summary',
            description: `**${displayName}**'s work summary for the day.`,
            color: 16705372, // Yellow
            fields: [
                {
                    name: 'Login Time',
                    value: `<t:${checkInTimestamp}:T>`,
                    inline: true,
                },
                {
                    name: 'Logout Time',
                    value: `<t:${checkOutTimestamp}:T>`,
                    inline: true,
                },
                 {
                    name: 'Total Duration',
                    value: totalHours,
                    inline: true,
                },
                {
                    name: 'Work Done Today',
                    value: `\`\`\`${workSummary}\`\`\``,
                    inline: false,
                }
            ],
            timestamp: new Date().toISOString(),
        }],
    };

    await sendDiscordWebhook(SUMMARY_WEBHOOK_URL, payload);
}
