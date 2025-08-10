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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { composeMessage, type ComposeMessageOutput } from '@/ai/flows/compose-message';
import { adjustTone, type AdjustToneOutput } from '@/ai/flows/adjust-tone';
import { suggestChannel, type SuggestChannelOutput } from '@/ai/flows/suggest-channel';
import { summarizeContent, type SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { Bot, Loader2, Wand2, Sparkles, Send, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { allChannels } from '@/lib/constants';

export function Dashboard() {
  const { toast } = useToast();
  const [isComposing, startComposing] = useTransition();
  const [isAdjusting, startAdjusting] = useTransition();
  const [isSuggesting, startSuggesting] = useTransition();
  const [isSummarizing, startSummarizing] = useTransition();

  const [draft, setDraft] = useState('');
  const [composedMessage, setComposedMessage] = useState('');
  
  const [tone, setTone] = useState('Standard');
  const [suggestedChannels, setSuggestedChannels] = useState<string[]>([]);
  
  const [longText, setLongText] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState('');

  const handleCompose = () => {
    if (!draft) {
      toast({ title: 'Draft is empty', description: 'Please enter some text to compose a message.', variant: 'destructive' });
      return;
    }
    startComposing(async () => {
      const result: ComposeMessageOutput = await composeMessage({ input: draft });
      setComposedMessage(result.message);
    });
  };

  const handleToneChange = (newTone: string) => {
    setTone(newTone);
    if (!composedMessage) {
      toast({ title: 'No message to adjust', description: 'Please compose a message first.', variant: 'destructive' });
      return;
    }
    startAdjusting(async () => {
      const result: AdjustToneOutput = await adjustTone({ message: composedMessage, tone: newTone as 'Formal' | 'Standard' | 'Celebratory' });
      setComposedMessage(result.adjustedMessage);
    });
  };
  
  const handleSuggestChannels = () => {
    if (!composedMessage) {
      toast({ title: 'No message content', description: 'Please compose a message to get channel suggestions.', variant: 'destructive' });
      return;
    }
    startSuggesting(async () => {
      const result: SuggestChannelOutput = await suggestChannel({ messageContent: composedMessage });
      setSuggestedChannels(result.suggestedChannels);
    });
  };

  const handleSummarize = () => {
    if (!longText) {
      toast({ title: 'No text to summarize', description: 'Please paste some text to generate a summary.', variant: 'destructive' });
      return;
    }
    startSummarizing(async () => {
      const result: SummarizeContentOutput = await summarizeContent({ longFormText: longText });
      setSummary(result.summary);
      setActionItems(result.actionItems);
    });
  };

  return (
    <Tabs defaultValue="composer" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="composer"><Wand2 className="mr-2" /> AI Message Composer</TabsTrigger>
        <TabsTrigger value="summarizer"><FileText className="mr-2" /> AI Content Summarizer</TabsTrigger>
      </TabsList>
      <TabsContent value="composer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Message Composer</CardTitle>
            <CardDescription>
              Enter a rough draft or bullet points, and let AI craft a polished message.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="draft">Your Draft</Label>
                <Textarea
                  id="draft"
                  placeholder="e.g., finished UI mockups for new dashboard. today starting on the API connection. blocked by missing API key from dev team."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="composed-message">Composed Message</Label>
                <Textarea
                  id="composed-message"
                  placeholder="AI will generate the message here..."
                  value={composedMessage}
                  onChange={(e) => setComposedMessage(e.target.value)}
                  className="min-h-[200px] bg-secondary"
                  readOnly={isComposing || isAdjusting}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCompose} disabled={isComposing}>
                {isComposing ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                Compose with AI
              </Button>
            </div>
            {composedMessage && (
               <div className="space-y-4 rounded-lg border p-4">
                 <h3 className="text-sm font-medium">Refine &amp; Target</h3>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <Label>Adjust Tone</Label>
                     <Select onValueChange={handleToneChange} value={tone} disabled={isAdjusting}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select tone" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Standard">Standard</SelectItem>
                         <SelectItem value="Formal">Formal</SelectItem>
                         <SelectItem value="Celebratory">Celebratory</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Destination Channel</Label>
                     <div className="flex gap-2">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a channel" />
                            </SelectTrigger>
                            <SelectContent>
                                {allChannels.map(channel => (
                                    <SelectItem key={channel} value={channel}>#{channel}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                       <Button onClick={handleSuggestChannels} disabled={isSuggesting} variant="outline">
                         {isSuggesting ? <Loader2 className="animate-spin" /> : <Bot />}
                         Suggest
                       </Button>
                     </div>
                   </div>
                 </div>
                 {suggestedChannels.length > 0 && (
                   <div className="space-y-2">
                     <Label>Suggested Channels</Label>
                     <div className="flex flex-wrap gap-2">
                       {suggestedChannels.map(channel => (
                         <Badge key={channel} variant="secondary">#{channel}</Badge>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" onClick={() => toast({ title: 'Message Sent!', description: 'Your message has been posted to Discord.'})} disabled={!composedMessage}>
                <Send className="mr-2" /> Send Message
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="summarizer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Content Summarizer</CardTitle>
            <CardDescription>
              Paste in long-form text like meeting notes to get a concise summary and action items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="long-text">Paste Text Here</Label>
              <Textarea
                id="long-text"
                placeholder="Paste your meeting notes or long document here..."
                className="min-h-[200px]"
                value={longText}
                onChange={(e) => setLongText(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <Button onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                Generate Summary
              </Button>
            </div>
            {(summary || actionItems) && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Card className="min-h-[100px] bg-secondary">
                    <CardContent className="p-4 text-sm">{summary}</CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <Label>Action Items</Label>
                  <Card className="min-h-[100px] bg-secondary">
                    <CardContent className="p-4 text-sm whitespace-pre-line">{actionItems}</CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
