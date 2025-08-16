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

  const welcomeName = user.username === 'Hariharan@Focusin01' ? 'Hariharan' : user.username;

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
                    <CrmPage />
                </CardContent>
            </Card>
        </div>
    </>
  );
}
