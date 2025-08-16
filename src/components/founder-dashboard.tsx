
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Briefcase, Fingerprint, MessageCircle, Users, ListChecks } from 'lucide-react';

interface FounderDashboardProps {
    setView: (view: 'dashboard' | 'crm' | 'biometrics' | 'discord' | 'tasks') => void;
}

export function FounderDashboard({ setView }: FounderDashboardProps) {

    const navItems = [
        {
            title: "Lead Management",
            description: "View, manage, and track customer leads.",
            icon: <Users className="h-8 w-8 text-primary" />,
            view: 'crm',
        },
        {
            title: "Biometrics Log",
            description: "Monitor team check-in and check-out data.",
            icon: <Fingerprint className="h-8 w-8 text-primary" />,
            view: 'biometrics',
        },
        {
            title: "Message Composer",
            description: "Draft and send announcements to Discord.",
            icon: <MessageCircle className="h-8 w-8 text-primary" />,
            view: 'discord',
        },
        {
            title: "Task Board",
            description: "View and manage tasks from Notion.",
            icon: <ListChecks className="h-8 w-8 text-primary" />,
            view: 'tasks',
        }
    ] as const;


    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {navItems.map((item) => (
                    <Card 
                        key={item.view} 
                        className="flex flex-col hover:border-primary transition-all duration-200 cursor-pointer"
                        onClick={() => setView(item.view)}
                    >
                        <CardHeader className="flex-grow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{item.title}</CardTitle>
                                    <CardDescription className="mt-2">{item.description}</CardDescription>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    {item.icon}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Button variant="outline" className="w-full">
                                Go to {item.title}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

    