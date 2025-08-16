'use client';

import { useSidebar } from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDown, Fingerprint, Activity, Users, ListChecks, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { channelCategories } from '@/lib/constants';


interface SidebarNavProps {
  currentView: string;
  setView: (view: string) => void;
}

export function SidebarNav({
  currentView,
  setView,
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
                    currentView === 'user-dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setView('user-dashboard')}
            >
                <Activity />
                <span>My Dashboard</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'flex items-center justify-start gap-2 rounded-md px-2 py-1 text-sm',
                     currentView === 'crm' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setView('crm')}
            >
                <Users />
                <span>Lead Management</span>
            </Button>
        </nav>
      );
    }
    
    // CEO View (only shows when on a specific page, not the main dashboard)
    if (currentView === 'discord') {
         return (
             <nav className="flex flex-col gap-2 px-2">
                {channelCategories.map((category, index) => (
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
                        {category.channels.map((channel) => (
                        <Button
                            key={channel.name}
                            variant="ghost"
                            size="sm"
                            className={cn(
                            'flex items-center justify-start gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground',
                            // selectedChannel === channel.name && 'bg-accent text-accent-foreground'
                            )}
                            // onClick={() => setSelectedChannel(channel.name)}
                        >
                            <span>{channel.icon}</span>
                            <span>{channel.name}</span>
                        </Button>
                        ))}
                    </div>
                    </CollapsibleContent>
                </Collapsible>
                ))}
            </nav>
        )
    }

    return null; // Return null for founder on main dashboard view
  };

  return renderNavForUser();
}

    