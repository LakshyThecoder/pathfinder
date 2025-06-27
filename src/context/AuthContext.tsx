'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onIdTokenChanged, User, signOut as firebaseSignOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionReady: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      setLoading(true); 
      setSessionReady(false); // Reset session readiness on any auth change
      setUser(newUser);

      try {
        if (newUser) {
          const token = await newUser.getIdToken();
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            toast({
              variant: 'destructive',
              title: 'Session Error',
              description: 'Could not synchronize your session with the server. Please try logging in again.'
            });
            await firebaseSignOut(auth);
          } else {
            setSessionReady(true); // SERVER SESSION IS NOW READY
          }
        } else {
          // User is logged out, clear the server session and session ready state.
          await fetch('/api/logout', { method: 'POST' });
          setSessionReady(false);
        }
      } catch (error) {
        console.error("Auth session sync error:", error);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Your session could not be synchronized with the server. Please try signing in again.',
        });
        await firebaseSignOut(auth);
        setSessionReady(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const logout = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
      toast({
        title: 'Success!',
        description: 'You have been logged in with Google.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    }
  };


  const value = {
    user,
    loading,
    sessionReady,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
