'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.37 1.62-3.82 1.62-4.66 0-8.4-3.82-8.4-8.5s3.74-8.5 8.4-8.5c2.37 0 4.03 1.02 5.2 2.02l2.6-2.6C18.92 1.4 16.1.42 12.48.42c-6.8 0-12.32 5.4-12.32 12.1s5.52 12.1 12.32 12.1c3.24 0 5.62-1.12 7.6-3.04 2.1-2.02 2.8-5.04 2.8-7.78v-1.3z" fill="currentColor"/>
    </svg>
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match.',
      });
      return;
    }
    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
    setIsGoogleLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Start your learning journey with PathFinder today.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <form onSubmit={handleSignup} className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    placeholder="6+ characters"
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? 'Redirecting...' : <><GoogleIcon /> Google</>}
            </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Login
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
