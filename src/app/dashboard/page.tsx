'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutGrid, Plus, BookOpen, TrendingUp, Target, Activity, CheckCircle, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AuthWall from '@/components/AuthWall';
import { getDashboardDataAction, getDailyChallengeAction } from '../actions';
import type { StoredRoadmap } from '@/types';
import type { DailyChallengeOutput } from '@/ai/flows/suggestion-generator';

interface DashboardData {
    stats: {
        roadmapsCreated: number;
        skillsCompleted: number;
        averageProgress: number;
        topicDistribution: { name: string; value: number }[];
    };
    recentRoadmaps: StoredRoadmap[];
}

function DashboardLoading() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-40 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Skeleton className="h-52 rounded-lg lg:col-span-1 md:col-span-2" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-80 rounded-lg" />
                </div>
                <div>
                    <Skeleton className="h-80 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [challenge, setChallenge] = useState<Partial<DailyChallengeOutput> & { error?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                const [dashboardData, challengeData] = await Promise.all([
                    getDashboardDataAction(),
                    getDailyChallengeAction(),
                ]);

                if (!dashboardData.error) {
                    setData(dashboardData as DashboardData);
                }
                
                setChallenge(challengeData);
                setLoading(false);
            };
            fetchData();
        }
    }, [user]);

    if (authLoading) {
        return <DashboardLoading />;
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

    if (loading) {
        return <DashboardLoading />;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user.email?.split('@')[0]}!</p>
                </div>
                <Button asChild className="mt-4 sm:mt-0">
                    <Link href="/"><Plus className="mr-2 h-4 w-4" /> Start a New Roadmap</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-1 md:col-span-2 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Today's Challenge
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {challenge ? (
                            <>
                                <p className="text-lg font-semibold">{challenge.challenge}</p>
                                {challenge.estimatedTime && (
                                     <p className="text-sm text-primary-foreground/80 mt-2">{challenge.estimatedTime}</p>
                                )}
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4 bg-primary-foreground/20" />
                                <Skeleton className="h-4 w-1/2 bg-primary-foreground/20" />
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roadmaps Started</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.stats.roadmapsCreated ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Your learning journeys</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Skills Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.stats.skillsCompleted ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Across all roadmaps</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Roadmaps</CardTitle>
                        <CardDescription>Continue where you left off.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recentRoadmaps && data.recentRoadmaps.length > 0 ? (
                                data.recentRoadmaps.map((roadmap) => (
                                    <div key={roadmap.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{roadmap.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Created on {new Date(roadmap.createdAt?.toDate()).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/roadmap?id=${roadmap.id}`}>Revisit</Link>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>You haven't created any roadmaps yet.</p>
                                    <Button variant="link" asChild><Link href="/">Start a new one!</Link></Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button variant="ghost" asChild>
                            <Link href="/history">View All History &rarr;</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Learning Activity</CardTitle>
                        <CardDescription>A breakdown of your topic categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.stats?.topicDistribution && data.stats.topicDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.stats.topicDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Roadmaps" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                No activity to display yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
