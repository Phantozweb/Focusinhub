"use client";

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (workSummary: string) => void;
}

export function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [workSummary, setWorkSummary] = useState('');

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    await onConfirm(workSummary);
    setIsLoggingOut(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a brief summary of the work you've completed during this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <Label htmlFor="work-summary">Work Summary</Label>
            <Textarea
                id="work-summary"
                placeholder="e.g., Updated the CRM component, drafted company announcement..."
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoggingOut || !workSummary}>
            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
