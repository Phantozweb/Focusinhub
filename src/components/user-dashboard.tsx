
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Clock, LogOut } from 'lucide-react';
import { LogoutDialog } from './logout-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { checkOutUser } from '@/services/notion';

type UserSession = {
  username: string;
  notionPageId: string;
  checkInTime: string;
};

interface UserDashboardProps {
  user: UserSession;
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [workedTime, setWorkedTime] = useState('Calculating...');
  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user?.checkInTime) return;

    const checkInDate = new Date(user.checkInTime);
    
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - checkInDate.getTime();
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const padded = (num: number) => num.toString().padStart(2, '0');

      setWorkedTime(`${padded(hours)}:${padded(minutes)}:${padded(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.checkInTime]);

  const completeLogout = () => {
    localStorage.removeItem('user');
    setLogoutDialogOpen(false);
    router.push('/login');
  };

  const handleLogoutConfirm = async (notes: string) => {
    if (!user || !user.notionPageId || !user.checkInTime) {
      toast({ title: "Session error", description: "No active session found. Logging you out.", variant: "destructive" });
      completeLogout();
      return;
    }

    try {
      await checkOutUser(user.notionPageId, user.checkInTime, notes);
      toast({ title: "Checked Out", description: "Your session has ended and your notes have been saved." });
    } catch (error) {
      console.error("Failed to check out user:", error);
      toast({
        title: 'Check-out Sync Failed',
        description: 'Could not save your notes to Notion, but you have been logged out.',
        variant: 'destructive',
      });
    } finally {
      completeLogout();
    }
  };

  const checkInTimeFormatted = user.checkInTime 
    ? new Date(user.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
    : 'N/A';
  
  const welcomeName = user.username === 'Hariharan@Focusin01' ? 'Hariharan' : user.username;

  return (
    <>
      <div className="grid gap-6">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome, {welcomeName}!</CardTitle>
            <CardDescription>
              Here is your daily session summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="rounded-lg border p-6 flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-muted-foreground">Checked In At</p>
                    <p className="text-3xl font-bold">{checkInTimeFormatted}</p>
                </div>
                <div className="rounded-lg border p-6 flex flex-col items-center justify-center bg-primary/5">
                    <p className="text-sm font-medium text-muted-foreground">Time Worked Today</p>
                    <p className="text-3xl font-bold font-mono flex items-center gap-2">
                        <Clock className="h-7 w-7 text-primary" />
                        {workedTime}
                    </p>
                </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => setLogoutDialogOpen(true)}>
                <LogOut className="mr-2" /> Check Out & End Session
            </Button>
          </CardContent>
        </Card>
      </div>
      {user && (
        <LogoutDialog
            isOpen={isLogoutDialogOpen}
            onClose={() => setLogoutDialogOpen(false)}
            onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  );
}
