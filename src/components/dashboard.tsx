"use client";

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Wand2, Sparkles, Send } from 'lucide-react';

export function Dashboard() {
  const { toast } = useToast();
  const [isSending, startSending] = useTransition();
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message) {
      toast({ title: 'Message is empty', description: 'Please enter a message to send.', variant: 'destructive' });
      return;
    }

    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      toast({ title: 'Webhook URL not configured', description: 'Please set the NEXT_PUBLIC_DISCORD_WEBHOOK_URL environment variable.', variant: 'destructive' });
      return;
    }

    startSending(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [
              {
                title: 'New Announcement',
                description: message,
                color: 7506394, // A nice purple color
                timestamp: new Date().toISOString(),
                footer: {
                  text: 'Sent from Focus-IN Hub',
                },
              },
            ],
          }),
        });

        if (response.ok) {
          toast({ title: 'Message Sent!', description: 'Your message has been posted to Discord.' });
          setMessage('');
        } else {
          const errorText = await response.text();
          toast({ title: 'Error Sending Message', description: `Discord API returned an error: ${errorText}`, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Failed to send message', description: 'Could not connect to the Discord webhook.', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> Message Broadcaster</CardTitle>
            <CardDescription>
              Craft your message and send it directly to your Discord server as a rich embed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="e.g., Team, let's welcome our new intern, Alex! They will be joining the marketing team."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" onClick={handleSendMessage} disabled={isSending || !message}>
                {isSending ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />} 
                Send Message
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
