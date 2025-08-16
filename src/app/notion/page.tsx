'use client';

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
import { getNotionTasks, GetNotionTasksOutput } from '@/ai/flows/notion-flow';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, ListChecks } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function NotionPage() {
  const [tasks, setTasks] = useState<GetNotionTasksOutput>([]);
  const [isLoading, startLoading] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startLoading(async () => {
      try {
        const notionTasks = await getNotionTasks();
        setTasks(notionTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch tasks from the database. Please check your integration connection.',
          variant: 'destructive',
        });
      }
    });
  }, [toast]);

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'Done':
        return 'default';
      case 'In progress':
        return 'secondary';
      case 'Not started':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            <CardTitle>Task Board</CardTitle>
        </div>
        <CardDescription>
          A live view of tasks from your connected database.
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
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(task.status)}>{task.status || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback><User size={14}/></AvatarFallback>
                      </Avatar>
                      <span>{task.assignee || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{task.createdTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
