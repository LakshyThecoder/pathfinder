
'use client';

import { Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthWall from '@/components/AuthWall';
import PageLoading from '@/components/PageLoading';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <PageLoading message="Loading your personalized dashboard..." />;
    }

    if (!user) {
        return (
            <div className="container mx-auto py-10 px-4">
                <AuthWall
                    title="Unlock Your Dashboard"
                    description="Please log in or create an account to view your personalized dashboard, track your progress, and manage your learning roadmaps."
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center flex flex-col items-center">
                <Wrench className="h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl font-bold tracking-tight">Dashboard Coming Soon!</h1>
                <p className="text-muted-foreground mt-2 max-w-md">
                    We're hard at work building an amazing dashboard experience for you. Check back soon for analytics, progress tracking, and more.
                </p>
            </div>
        </div>
    );
}
