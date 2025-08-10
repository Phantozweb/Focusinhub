'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ShieldBan } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Eye className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Focus-IN Hub Login</CardTitle>
          <CardDescription>Enter your credentials to access the hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="e.g. Jana@Ceo"
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
          </div>
          <Button onClick={handleLogin} className="w-full mt-6">
            Log In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
