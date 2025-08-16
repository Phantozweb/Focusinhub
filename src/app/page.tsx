'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { UserNav } from '@/components/user-nav';
import { Dashboard } from '@/components/dashboard';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotionPage from './notion/page';
import BiometricsPage from './biometrics/page';
import { UserDashboard } from '@/components/user-dashboard';
import CrmPage from './crm/page';

type UserSession = {
  username: string;
  notionPageId: string;
  checkInTime: string;
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('company-announcements');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if (parsedUser?.username !== 'Jana@Ceo') {
            setSelectedChannel('user-dashboard');
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Clear broken user data and redirect to login
        localStorage.removeItem('user');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated || !user) {
    return null; // Or a loading spinner
  }
  
  const renderContent = () => {
    if (selectedChannel === 'user-dashboard' && user.username !== 'Jana@Ceo') {
        return <UserDashboard user={user} />;
    }
    if (selectedChannel === 'crm') {
      return <CrmPage />;
    }
    if (user.username === 'Jana@Ceo') {
        if (selectedChannel === 'notion-tasks') {
          return <NotionPage />;
        }
        if (selectedChannel === 'biometrics') {
          return <BiometricsPage />;
        }
        return <Dashboard selectedChannel={selectedChannel} />;
    }
     // Fallback for non-ceo users if they land on a channel they shouldn't see
     return <UserDashboard user={user} />;
  };

  const getWelcomeMessage = () => {
      if (!user) return "Welcome!";
      if (user.username === 'Jana@Ceo') return "Welcome, Founder!";
      if (user.username === 'Hariharan@Focusin01') return "Welcome, Hariharan!";
      return `Welcome, ${user.username}!`;
  }

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-xl font-semibold">
              Focus-IN Hub
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
             <div className="hidden items-center gap-2 md:flex">
                <h1 className="font-headline text-lg font-semibold">
                  {getWelcomeMessage()}
                </h1>
            </div>
          </div>
           <div className="flex items-center gap-4">
              <UserNav />
           </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </>
  );
}
