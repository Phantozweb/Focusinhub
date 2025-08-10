'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { UserNav } from '@/components/user-nav';
import { Dashboard } from '@/components/dashboard';
import { Input } from '@/components/ui/input';
import { Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from './login/page';

export default function Home() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setIsAuthenticated(true);
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!isAuthenticated) {
        return null; // Or a loading spinner
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
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden items-center gap-2 md:flex">
                <h1 className="font-headline text-lg font-semibold">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden w-full max-w-sm sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="bg-background pl-8"
              />
            </div>
            <div className="hidden sm:flex">
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Dashboard />
        </main>
      </SidebarInset>
    </>
  );
}
