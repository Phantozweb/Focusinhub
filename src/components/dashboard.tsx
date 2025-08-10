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
import { Bot, Loader2, Wand2, Sparkles, Send, FileCheck2, Pencil, User, ThumbsUp } from 'lucide-react';
import { draftMessage } from '@/ai/flows/draft-message-flow';
import { allChannels } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type User = {
    username: string;
};

type ChatMessage = {
    sender: 'user' | 'ai';
    text: string;
    isDraft?: boolean;
};

export function Dashboard({ selectedChannel }: { selectedChannel: string }) {
  const { toast } = useToast();
  const [isSending, startSending] = useTransition();
  const [isDrafting, startDrafting] = useTransition();
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [finalDraft, setFinalDraft] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSendToAI = () => {
    if (!currentMessage) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: currentMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    
    startDrafting(async () => {
      try {
        const result = await draftMessage({ rawMessage: currentMessage });
        const newAiMessage: ChatMessage = { sender: 'ai', text: result.draft, isDraft: true };
        setChatHistory(prev => [...prev, newAiMessage]);
        setFinalDraft(result.draft);
      } catch (error) {
        toast({ title: 'Error drafting message', description: 'Could not connect to the AI service.', variant: 'destructive' });
        const errorAiMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I had trouble drafting that message.' };
        setChatHistory(prev => [...prev, errorAiMessage]);
      }
    });
  };

  const handleApproveDraft = () => {
      if (!finalDraft) return;
      handleSendMessage(finalDraft);
  };
  
  const handleUseAsNewMessage = (text: string) => {
    setCurrentMessage(text);
    setFinalDraft(null);
    setChatHistory(prev => prev.filter(msg => !(msg.isDraft && msg.text === text)));
  }

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend) {
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
                description: messageToSend,
                color: 2123432, // Soft blue
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
          setCurrentMessage('');
          setChatHistory([]);
          setFinalDraft(null);
        } else {
          const errorText = await response.text();
          toast({ title: 'Error Sending Message', description: `Discord API returned an error: ${errorText}`, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Failed to send message', description: 'Could not connect to the Discord webhook.', variant: 'destructive' });
      }
    });
  };

  const isCeo = user?.username === 'Jana@Ceo';

  return (
    <div className="w-full grid gap-6">
        <Card className="flex flex-col h-[calc(100vh-4rem)]">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot /> Message Composer
            </CardTitle>
            <CardDescription>
              Drafting for <span className="font-bold text-primary">#{selectedChannel}</span>. Chat with the AI to craft the perfect message.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat, index) => (
                  <div key={index} className={cn("flex items-start gap-3", chat.sender === 'user' ? 'justify-end' : 'justify-start')}>
                      {chat.sender === 'ai' && (
                          <Avatar className="w-8 h-8">
                              <AvatarFallback><Bot size={20} /></AvatarFallback>
                          </Avatar>
                      )}
                      <div className={cn("max-w-md p-3 rounded-lg", chat.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <p className="text-sm whitespace-pre-wrap">{chat.text}</p>
                          {chat.isDraft && (
                              <div className='flex gap-2 mt-4'>
                                  <Button size="sm" onClick={() => handleUseAsNewMessage(chat.text)} variant="outline"><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                                  <Button size="sm" onClick={handleApproveDraft} disabled={isSending} className="bg-green-600 hover:bg-green-700">
                                      {isSending ? <Loader2 className="animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                      Approve & Send
                                  </Button>
                              </div>
                          )}
                      </div>
                      {chat.sender === 'user' && (
                          <Avatar className="w-8 h-8">
                                <AvatarImage src={isCeo ? "https://i.pravatar.cc/150?u=a042581f4e29026704d" : undefined} alt="User Avatar" />
                                <AvatarFallback>{user ? user.username.substring(0,2).toUpperCase() : <User size={20} />}</AvatarFallback>
                          </Avatar>
                      )}
                  </div>
              ))}
               {isDrafting && (
                  <div className="flex items-center gap-2 text-muted-foreground justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="animate-spin" />
                      </div>
                  </div>
              )}
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className='w-full flex items-center gap-2'>
              <Textarea
                  id="message"
                  placeholder={finalDraft ? "The AI has provided a draft. You can edit it or approve it." : "Type your message or refinement here..."}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendToAI();
                    }
                  }}
                  disabled={!!finalDraft || isDrafting}
              />
              <Button onClick={handleSendToAI} disabled={!currentMessage || !!finalDraft || isDrafting}>
                {isDrafting ? <Loader2 className="animate-spin" /> : <Wand2 />} 
                <span className='sr-only'>Draft with AI</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
    </div>
  );
}
