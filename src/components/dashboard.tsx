"use client";

import { useState, useTransition, useEffect } from 'react';
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
import { draftMessage } from '@/ai/flows/draft-message-flow';
import { allChannels } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type User = {
    username: string;
};

export function Dashboard({ selectedChannel }: { selectedChannel: string }) {
  const { toast } = useToast();
  const [isSending, startSending] = useTransition();
  const [isDrafting, startDrafting] = useTransition();
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

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
    if (selectedChannel === 'company-announcements') {
        webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL_ANNOUNCEMENTS!;
    } else if (selectedChannel === 'project-roadmap') {
        webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL_ROADMAP!;
    }

    if (!webhookUrl && (selectedChannel === 'company-announcements' || selectedChannel === 'project-roadmap')) {
      toast({ title: 'Webhook URL not configured', description: `Webhook for '${selectedChannel}' is not set.`, variant: 'destructive' });
      return;
    }
    
    if (!allChannels.includes(selectedChannel)) {
      toast({ title: 'Invalid Channel', description: `The channel '${selectedChannel}' is not a valid channel.`, variant: 'destructive' });
      return;
    }
    
    if(!webhookUrl) {
      toast({ title: 'Messaging not supported', description: `Messaging to '${selectedChannel}' is not supported yet.`, variant: 'destructive' });
      return;
    }

    const senderName = user?.username === 'Jana@Ceo' ? 'Janarthan' : user?.username || 'Unknown User';
    const sentAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });


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
                title: `New Message in #${selectedChannel}`,
                description: finalMessage,
                color: 7506394, // A nice purple color
                timestamp: new Date().toISOString(),
                footer: {
                  text: `Sent by ${senderName} at ${sentAt}`,
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
              You are currently sending to <span className="font-bold text-primary">#{selectedChannel}</span>. Craft your message, let the AI refine it, and send it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
