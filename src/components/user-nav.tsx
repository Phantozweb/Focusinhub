
'use client';

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { LogoutDialog } from "./logout-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkOutUser } from "@/services/notion";


type UserSession = {
    username: string;
    notionPageId: string;
    checkInTime: string;
};

export function UserNav() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<UserSession | null>(null);
    const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const completeLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setLogoutDialogOpen(false);
        router.push('/login');
    }

    const handleLogoutConfirm = async (notes: string) => {
        if (!user || !user.notionPageId || !user.checkInTime) {
            toast({ title: "Session error", description: "No active session found. Logging you out.", variant: "destructive" });
            completeLogout();
            return;
        }

        try {
            await checkOutUser(user.notionPageId, user.checkInTime, notes);
            toast({ title: "Logged Out", description: "Your session has ended and your notes have been saved."});
        } catch (error) {
            console.error("Failed to check out user:", error);
            toast({
                title: 'Logout Sync Failed',
                description: 'Could not save your notes to Notion, but you have been logged out.',
                variant: 'destructive',
            });
        } finally {
            completeLogout();
        }
    };


    const getUserDisplayName = () => {
        if (!user) return '';
        if (user.username === 'Jana@Ceo') return 'Janarthan';
        if (user.username === 'Hariharan@Focusin01') return 'Hariharan';
        return user.username;
    }

    const getUserRole = () => {
        if (!user) return '';
        if (user.username === 'Jana@Ceo') return 'Founder & CEO';
        return 'Team Member';
    }

  return (
    <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            {user ? (
                <>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {getUserRole()}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </>
            ) : (
                <DropdownMenuItem onClick={() => router.push('/login')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log In</span>
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
        </DropdownMenu>
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
