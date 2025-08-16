'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendCheckInNotification } from '@/services/discord';

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    let user: { username: string } | null = null;

    if (userId === 'Jana@Ceo' && password === 'Janarthan@09876') {
        user = { username: 'Jana@Ceo' };
    } else if (userId === 'Hariharan@Focusin01' && password === 'h@rih@ran0789') {
        user = { username: 'Hariharan@Focusin01' };
    } else if (userId === 'Mugunthan@Focusin01' && password === 'mugunthan@focusin') {
        user = { username: 'Mugunthan@Focusin01' };
    }

    if (user) {
        const checkInTime = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('checkInTime', checkInTime);

        try {
            await sendCheckInNotification(user.username, checkInTime);
        } catch (error) {
            console.error("Failed to send check-in notification", error);
            // Non-critical, so we don't block login
        }

        router.push('/');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid User ID or Password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative grid min-h-screen w-full items-center justify-center bg-background">
       <div className="absolute inset-0 bg-gradient-to-br from-background to-slate-900/50 via-background -z-10" />
       <div className="grid min-h-screen w-full grid-cols-1 items-center justify-center p-4 animate-in fade-in-25 duration-1000 md:grid-cols-2 md:p-0">
            <div className="hidden flex-col justify-center p-12 text-white md:flex">
                <div className="flex items-center gap-4">
                     <Rocket className="h-12 w-12 text-primary" />
                     <h1 className="font-headline text-5xl font-bold">Focus-IN Hub</h1>
                </div>
                <p className="mt-4 text-2xl font-medium text-muted-foreground">
                    The all-in-one workspace for Focus-IN.
                </p>
                <p className="mt-2 text-lg text-muted-foreground/80">
                    A unified workspace to manage customers, view tasks, and streamline team communication.
                </p>
            </div>
             <div className="flex w-full items-center justify-center p-4">
                <Card className="w-full max-w-sm animate-in fade-in-50 zoom-in-95 duration-1000 fill-mode-both">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Focus-IN Hub Login</CardTitle>
                    <CardDescription>Enter your credentials to access the hub.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                        id="password"
                        type="password"
                        value={password}
                        placeholder='•••••••••••••'
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </div>
                    <Button type="submit" className="w-full !mt-6">
                        Log In
                    </Button>
                    </form>
                </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
