"use client";

import { useEffect, useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, ListChecks, Signal, SignalLow, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BiometricRecord, getBiometricData } from '@/services/notion';

export default function BiometricsPage() {
  const [records, setRecords] = useState<BiometricRecord[]>([]);
  const [isLoading, startLoading] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startLoading(async () => {
      try {
        const biometricData = await getBiometricData();
        setRecords(biometricData);
      } catch (error) {
        console.error('Failed to fetch biometric data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch biometrics from Notion.',
          variant: 'destructive',
        });
      }
    });
  }, [toast]);

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Offline':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const onlineUsers = records.filter(r => r.status === 'Online').length;
  const totalRecords = records.length;


  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    <CardTitle>Team Statistics</CardTitle>
                </div>
                <CardDescription>A real-time overview of team activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Signal className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Online Now</p>
                        <p className="text-2xl font-bold">{onlineUsers}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <ListChecks className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sessions Today</p>
                        <p className="text-2xl font-bold">{totalRecords}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <ListChecks className="h-6 w-6" />
                <CardTitle>Biometrics Log</CardTitle>
            </div>
            <CardDescription>
            A live log of check-in and check-out data from Notion.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {records.map((record) => (
                    <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(record.status)} className="gap-1">
                            {record.status === 'Online' ? <Signal size={12} /> : <SignalLow size={12}/>}
                            {record.status || 'N/A'}
                        </Badge>
                    </TableCell>
                    <TableCell>{record.checkIn || 'N/A'}</TableCell>
                    <TableCell>{record.checkOut || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.notes || 'N/A'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
