'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { channelCategories } from '@/lib/constants';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDown, Fingerprint, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SidebarNavProps {
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
}

export function SidebarNav({
  selectedChannel,
  setSelectedChannel,
}: SidebarNavProps) {
  const { open } = useSidebar();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
  }, []);

  const isCeo = user?.username === 'Jana@Ceo';

  const renderNavForUser = () => {
    if (!isCeo) {
      // Non-CEO View
      return (
        <nav className="flex flex-col gap-2 px-2">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'flex items-center justify-start gap-2 rounded-md px-2 py-1 text-sm',
                    selectedChannel === 'user-dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setSelectedChannel('user-dashboard')}
            >
                <Activity />
                <span>My Dashboard</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'flex items-center justify-start gap-2 rounded-md px-2 py-1 text-sm',
                     selectedChannel === 'crm' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setSelectedChannel('crm')}
            >
                <Fingerprint />
                <span>Lead Management</span>
            </Button>
        </nav>
      );
    }

    // CEO View
    return (
      <nav className="flex flex-col gap-2 px-2">
        {channelCategories.map((category, index) => {
          const channelsToShow = category.channels.filter(
            (channel) => !channel.isPrivate || isCeo
          );

          if (channelsToShow.length === 0) return null;

          return (
            <Collapsible key={index} defaultOpen={true}>
              <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-headline">{category.name}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-2 flex flex-col gap-1 border-l pl-4">
                  {channelsToShow.map((channel) => (
                    <Button
                      key={channel.name}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'flex items-center justify-start gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground',
                        selectedChannel === channel.name &&
                          'bg-accent text-accent-foreground'
                      )}
                      onClick={() => setSelectedChannel(channel.name)}
                    >
                      <span>{channel.icon}</span>
                      <span>{channel.name}</span>
                      {open && channel.isPrivate && (
                        <span className="ml-auto text-xs text-primary/70">
                          (Private)
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    );
  };

  return renderNavForUser();
}
