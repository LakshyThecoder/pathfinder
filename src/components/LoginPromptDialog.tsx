import {
  AlertDialog,
  AlertDialogAction,
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
}

export default function LoginPromptDialog({ isOpen, onOpenChange }: LoginPromptDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">Unlock AI Insights</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Please log in or create an account to chat with our AI assistant and get personalized insights for your learning journey.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <Button asChild>
                <Link href="/login"><LogIn /> Login</Link>
            </Button>
            <Button variant="secondary" asChild>
                <Link href="/signup"><UserPlus /> Sign Up</Link>
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
