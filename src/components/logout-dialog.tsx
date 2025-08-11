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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './ui/label';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
}

export function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
  const [notes, setNotes] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    await onConfirm(notes);
    setIsLoggingOut(false);
    setNotes(''); // Reset for next time
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log Out & Save Notes</AlertDialogTitle>
          <AlertDialogDescription>
            Before you go, please summarize what you've worked on during this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full gap-2">
            <Label htmlFor="notes">Work Summary / Notes</Label>
            <Textarea
                id="notes"
                placeholder="e.g., Fixed the login page styles, integrated Notion API for tasks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!notes || isLoggingOut}>
            {isLoggingOut ? 'Saving...' : 'Log Out & Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
