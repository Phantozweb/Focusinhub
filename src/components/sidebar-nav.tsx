"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { channelCategories } from "@/lib/constants";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react";

export function SidebarNav() {
  const { open } = useSidebar();

  return (
    <nav className="flex flex-col gap-2 px-2">
      {channelCategories.map((category, index) => (
        <Collapsible key={index} defaultOpen={true}>
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent">
                <div className="flex items-center gap-2">
                    <span className="font-headline">{category.name}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="ml-4 mt-2 flex flex-col gap-1 border-l pl-4">
                    {category.channels.map((channel) => (
                        <div key={channel.name} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground">
                            <span>{channel.isPrivate ? "🔒" : "📢"}</span>
                            <span>{channel.name}</span>
                            {open && channel.isLeadershipOnly && (
                                <span className="ml-auto text-xs text-primary/70">(Leadership)</span>
                            )}
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
      ))}
    </nav>
  );
}
