'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onIdTokenChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      setLoading(false);
      setUser(newUser);
      
      if (newUser) {
        const token = await newUser.getIdToken();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during login.' }));
                toast({
                    variant: "destructive",
                    title: "Server Authentication Failed",
                    description: (
                      <div>
                        <p>{errorData.message || "Could not create a secure session."}</p>
                        {errorData.url && (
                           <a href={errorData.url} target="_blank" rel="noopener noreferrer" className="underline mt-2 inline-block font-semibold">
                            {errorData.urlText || "Click here for more info"}
                          </a>
                        )}
                      </div>
                    )
                });
            }
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Failed to connect to the server for authentication.",
            });
        }
      } else {
         // User is logged out, clear the session cookie
         await fetch('/api/logout', { method: 'POST' });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    // The onIdTokenChanged listener will handle the API logout call and routing
    router.push('/');
  };

  const value = {
    user,
    loading,
    logout,
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
