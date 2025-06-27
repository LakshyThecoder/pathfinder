import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bot, LogIn, UserPlus } from "lucide-react";

interface LoginPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export default function LoginPromptDialog({ isOpen, onOpenChange, title, description }: LoginPromptDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">{title || 'Authentication Required'}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description || 'Please log in or create an account to use this feature.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <Button asChild className="w-full">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4"/> Login</Link>
            </Button>
            <Button variant="secondary" asChild className="w-full">
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4"/> Sign Up</Link>
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
