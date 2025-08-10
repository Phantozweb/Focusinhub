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
import { Bot, Loader2, Wand2, Sparkles, Send, FileCheck2, Pencil } from 'lucide-react';
import { draftMessage, DraftMessageInput } from '@/ai/flows/draft-message-flow';
import { allChannels } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Dashboard() {
  const { toast } = useToast();
  const [isSending, startSending] = useTransition();
  const [isDrafting, startDrafting] = useTransition();
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState('');
  const [channel, setChannel] = useState('company-announcements');

  const handleDraftMessage = async () => {
    if (!message) {
      toast({ title: 'Message is empty', description: 'Please enter a message to draft.', variant: 'destructive' });
      return;
    }
    setDraft('');
    startDrafting(async () => {
      try {
        const result = await draftMessage({ rawMessage: message });
        setDraft(result.draft);
      } catch (error) {
        toast({ title: 'Error drafting message', description: 'Could not connect to the AI service.', variant: 'destructive' });
      }
    });
  };

  const handleSendMessage = async () => {
    const finalMessage = draft || message;
    if (!finalMessage) {
      toast({ title: 'Message is empty', description: 'Please enter a message to send.', variant: 'destructive' });
      return;
    }

    let webhookUrl = '';
    if (channel === 'company-announcements') {
        webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL_ANNOUNCEMENTS!;
    } else if (channel === 'project-roadmap') {
        webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL_ROADMAP!;
    }

    if (!webhookUrl) {
      toast({ title: 'Webhook URL not configured', description: `Webhook for '${channel}' is not set.`, variant: 'destructive' });
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
                title: `New Message in #${channel}`,
                description: finalMessage,
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
          setDraft('');
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
    <div className="w-full grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> Message Broadcaster</CardTitle>
            <CardDescription>
              Select a channel, craft your message, let the AI refine it, and send it to your Discord server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                   <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="company-announcements">#company-announcements</SelectItem>
                        <SelectItem value="project-roadmap">#project-roadmap</SelectItem>
                    </SelectContent>
                    </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Raw Message</Label>
                <Textarea
                  id="message"
                  placeholder="e.g., hey team, new intern alex is starting monday on marketing team, lets welcome them"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <Button onClick={handleDraftMessage} disabled={isDrafting || !message}>
                {isDrafting ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2" />} 
                Draft with AI
              </Button>

              {isDrafting && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" />
                      <span>AI is drafting your message...</span>
                  </div>
              )}

              {draft && (
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle className='font-headline'>AI-Generated Draft</AlertTitle>
                    <AlertDescription className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{draft}</p>
                        <div className='flex gap-2 mt-4'>
                            <Button size="sm" onClick={() => setDraft('')} variant="outline"><Pencil className="mr-2" />Edit</Button>
                            <Button size="sm" onClick={() => {
                                setMessage(draft);
                                setDraft('');
                            }}><FileCheck2 className="mr-2" />Use This Draft</Button>
                        </div>
                    </AlertDescription>
                </Alert>
              )}
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" onClick={handleSendMessage} disabled={isSending || (!message && !draft)}>
                {isSending ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />} 
                Send to Discord
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
