'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (userId === 'Jana@Ceo' && password === 'Janarthan@09876') {
      localStorage.setItem('user', JSON.stringify({ username: 'Jana@Ceo' }));
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
    <div className="relative min-h-screen w-full bg-background">
       <div className="absolute inset-0 bg-gradient-to-br from-background to-slate-900/50 via-background -z-10" />
       <div className="grid min-h-screen grid-cols-1 animate-in fade-in-25 duration-1000 md:grid-cols-2">
            <div className="hidden flex-col justify-center p-12 text-white md:flex">
                <div className="flex items-center gap-4">
                     <Rocket className="h-12 w-12 text-primary" />
                     <h1 className="font-headline text-5xl font-bold">Focus-IN Hub</h1>
                </div>
                <p className="mt-4 text-2xl font-medium text-muted-foreground">
                    Welcome to the workspace message composer tool for Discord.
                </p>
                <p className="mt-2 text-lg text-muted-foreground/80">
                    Craft, refine, and send perfect announcements with the power of AI.
                </p>
            </div>
             <div className="flex items-center justify-center p-4">
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
