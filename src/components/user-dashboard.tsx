'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import CrmPage from '@/app/crm/page';

type UserSession = {
  username: string;
};

interface UserDashboardProps {
  user: UserSession;
}

export function UserDashboard({ user }: UserDashboardProps) {

  let welcomeName = user.username;
  if (user.username === 'Hariharan@Focusin01') welcomeName = 'Hariharan';
  if (user.username === 'Mugunthan@Focusin01') welcomeName = 'Mugunthan';


  return (
    <>
        <div className="grid gap-6">
             <Card>
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline">Welcome, {welcomeName}!</CardTitle>
                    <CardDescription>
                        Here is your Lead Management dashboard.
                    </CardDescription>
                 </CardHeader>
                <CardContent>
                    {/* The CrmPage is rendered directly here for non-founders */}
                </CardContent>
             </Card>
        </div>
    </>
  );
}
