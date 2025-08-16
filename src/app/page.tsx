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
import { Eye, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotionPage from './notion/page';
import CrmPage from './crm/page';
import { FounderDashboard } from '@/components/founder-dashboard';
import { Button } from '@/components/ui/button';
import { UserDashboard } from '@/components/user-dashboard';

type UserSession = {
  username: string;
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'crm', 'discord', 'tasks'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Set default view based on user type
        if (parsedUser?.username !== 'Jana@Ceo') {
            setCurrentView('crm');
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
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
    if (user.username === 'Jana@Ceo') {
      switch (currentView) {
        case 'dashboard':
          return <FounderDashboard setView={setCurrentView} />;
        case 'crm':
          return <CrmPage />;
        case 'discord':
          return <Dashboard selectedChannel={'company-announcements'} />;
         case 'tasks':
          return <NotionPage />;
        default:
          return <FounderDashboard setView={setCurrentView} />;
      }
    } else {
        // Non-founder view defaults to CRM
        return <CrmPage />;
    }
  };

  const getWelcomeMessage = () => {
      if (!user) return "Welcome!";
      let welcomeName = user.username;
      if (user.username === 'Jana@Ceo') {
          switch(currentView) {
              case 'dashboard': return "Founder's Dashboard";
              case 'crm': return "Lead Management";
              case 'discord': return "Message Composer";
              case 'tasks': return "Task Board";
              default: return "Focus-IN Hub";
          }
      };
      if (user.username === 'Hariharan@Focusin01') welcomeName = "Hariharan";
      if (user.username === 'Mugunthan@Focusin01') welcomeName = "Mugunthan";
      return `Welcome, ${welcomeName}!`;
  }
  
  return (
    <>
      <Sidebar className="border-r">
         {user.username === 'Jana@Ceo' && currentView !== 'dashboard' && (
            <SidebarHeader>
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 justify-start">
                    <LayoutDashboard /> Back to Dashboard
                </Button>
            </SidebarHeader>
        )}
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
            currentView={currentView}
            setView={setCurrentView}
            user={user}
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
