"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Wand2, ThumbsUp, User, Pencil, Send } from 'lucide-react';
import { draftMessage, DraftMessageOutput, DraftMessageInput } from '@/ai/flows/draft-message-flow';
import { allChannels } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

type UserProfile = {
    username: string;
};

type ChatMessage = {
    role: 'user' | 'model';
    content: string;
    isDraft?: boolean;
    draft?: DraftMessageOutput;
};

export function Dashboard({ selectedChannel }: { selectedChannel: string }) {
  const { toast } = useToast();
  const [isSending, startSending] = useTransition();
  const [isDrafting, startDrafting] = useTransition();
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentDraft, setCurrentDraft] = useState<DraftMessageOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isDrafting]);

  const handleSendToAI = () => {
    if (!chatInput) return;

    const newUserMessage: ChatMessage = { role: 'user', content: chatInput };
    
    // We need to shape the history correctly for the AI
    const historyForAI: DraftMessageInput['history'] = chatHistory.map(msg => {
        if(msg.role === 'model' && msg.draft) {
            return { role: 'model', content: JSON.stringify(msg.draft) }
        }
        return { role: msg.role, content: msg.content };
    });

    const newHistory = [...historyForAI, { role: 'user', content: chatInput }];
    setChatHistory(prev => [...prev, newUserMessage]);
    
    const initialMessage = chatHistory.length === 0 ? chatInput : undefined;
    setChatInput('');
    
    startDrafting(async () => {
      try {
        const result = await draftMessage({ history: newHistory, initialMessage });
        const newAiMessage: ChatMessage = { role: 'model', content: result.draft, isDraft: true, draft: result };
        setChatHistory(prev => [...prev, newAiMessage]);
        setCurrentDraft(result);
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast({ title: 'Error drafting message', description: 'Could not connect to the AI service.', variant: 'destructive' });
        const errorAiMessage: ChatMessage = { role: 'model', content: 'Sorry, I had trouble drafting that message.' };
        setChatHistory(prev => [...prev, errorAiMessage]);
      }
    });
  };

  const handleApproveDraft = () => {
      if (!currentDraft?.draft || !currentDraft?.title) return;
      handleSendMessage(currentDraft.title, currentDraft.draft);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  }

  const handleSendMessage = async (title: string, messageToSend: string) => {
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

    const isCeo = user?.username === 'Jana@Ceo';
    const senderName = isCeo ? 'Janarthan (Founder & CEO)' : user?.username || 'Unknown User';
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
                title: title,
                description: messageToSend,
                color: 6940250, // Muted green accent
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
          setChatInput('');
          setChatHistory([]);
          setCurrentDraft(null);
          setIsEditing(false);
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
  const hasDraft = currentDraft !== null;

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
          <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat, index) => (
                  <div key={index} className={cn("flex items-start gap-3", chat.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {chat.role === 'model' && (
                          <Avatar className="w-8 h-8">
                              <AvatarFallback><Bot size={20} /></AvatarFallback>
                          </Avatar>
                      )}
                      <div className={cn("max-w-md p-3 rounded-lg", chat.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          {chat.isDraft && chat.draft && !isEditing && (
                              <div className='flex flex-col gap-2'>
                                  <p className="font-bold text-lg">{chat.draft.title}</p>
                                  <p className="text-sm whitespace-pre-wrap">{chat.draft.draft}</p>
                                  <div className='flex gap-2 mt-2'>
                                      <Button size="sm" onClick={handleStartEditing} variant="outline"><Pencil className="mr-2 h-4 w-4" />Edit Manually</Button>
                                  </div>
                              </div>
                          )}
                           {(chat.isDraft && isEditing && chat.draft) ? (
                              // This message is the current draft being edited, so we don't display it here.
                              // The editing UI is in the footer.
                              null
                           ) : !chat.isDraft && <p className="text-sm whitespace-pre-wrap">{chat.content}</p> }
                      </div>
                      {chat.role === 'user' && (
                          <Avatar className="w-8 h-8">
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
          <CardFooter className="p-4 border-t flex flex-col gap-4">
            {currentDraft && isEditing && (
                <div className="w-full space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Textarea 
                        id="edit-title" 
                        value={currentDraft.title}
                        onChange={(e) => setCurrentDraft(d => d ? {...d, title: e.target.value} : null)}
                        className="text-lg font-bold"
                    />
                     <Label htmlFor="edit-draft">Draft</Label>
                    <Textarea 
                        id="edit-draft" 
                        value={currentDraft.draft}
                        onChange={(e) => setCurrentDraft(d => d ? {...d, draft: e.target.value} : null)}
                        className="min-h-[150px]"
                    />
                </div>
            )}
            <div className='w-full flex items-center gap-2'>
              <Textarea
                  id="message"
                  placeholder={hasDraft ? "Refine the draft or ask for variations..." : "Type your initial message idea here..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendToAI();
                    }
                  }}
                  disabled={isDrafting}
              />
              <Button onClick={handleSendToAI} disabled={!chatInput || isDrafting}>
                {isDrafting ? <Loader2 className="animate-spin" /> : (chatHistory.length === 0 ? <Wand2 /> : <Send />)} 
                <span className='sr-only'>{chatHistory.length === 0 ? 'Draft with AI' : 'Send'}</span>
              </Button>
            </div>
            {currentDraft && (
                 <Button onClick={handleApproveDraft} disabled={isSending} className="w-full bg-green-600 hover:bg-green-700">
                    {isSending ? <Loader2 className="animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                    Approve & Send to #{selectedChannel}
                </Button>
            )}
          </CardFooter>
        </Card>
    </div>
  );
}
