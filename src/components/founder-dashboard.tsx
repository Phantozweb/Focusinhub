'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowRight, MessageCircle, Users, ListChecks } from 'lucide-react';

interface FounderDashboardProps {
    setView: (view: 'dashboard' | 'crm' | 'discord' | 'tasks') => void;
}

export function FounderDashboard({ setView }: FounderDashboardProps) {

    const navItems = [
        {
            title: "Lead Management",
            description: "View, manage, and track customer leads. Upload JSON files, track statuses, and engage with potential clients.",
            icon: <Users className="h-8 w-8 text-primary" />,
            view: 'crm',
        },
        {
            title: "Message Composer",
            description: "Draft and send rich, professional announcements to any Discord channel using the power of AI assistance.",
            icon: <MessageCircle className="h-8 w-8 text-primary" />,
            view: 'discord',
        },
        {
            title: "Task Board",
            description: "Get a live, read-only view of your team's tasks directly from your connected Notion database.",
            icon: <ListChecks className="h-8 w-8 text-primary" />,
            view: 'tasks',
        }
    ] as const;


    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-6">
                {navItems.map((item) => (
                    <Card 
                        key={item.view} 
                        className="group flex flex-col hover:border-primary transition-all duration-300 cursor-pointer"
                        onClick={() => setView(item.view)}
                    >
                        <CardHeader className="flex-grow">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                                        <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="hidden md:flex h-12 w-12 self-center transition-transform duration-300 group-hover:translate-x-1">
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
