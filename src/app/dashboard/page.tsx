"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LayoutGrid, Plus, BookOpen, TrendingUp, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AuthWall from "@/components/AuthWall";

const dummyRecentRoadmaps = [
  { id: 1, title: "Mastering React Hooks", date: "2 days ago", query: "React Hooks" },
  { id: 2, title: "The Art of Public Speaking", date: "1 week ago", query: "Public Speaking" },
  { id: 3, title: "Intro to Machine Learning", date: "3 weeks ago", query: "Machine Learning" },
];

const learningProgressData = [
  { name: 'React', progress: 75 },
  { name: 'Python', progress: 40 },
  { name: 'Design', progress: 60 },
  { name: 'DevOps', progress: 25 },
  { name: 'AI/ML', progress: 90 },
];

const topicsData = [
    { name: 'Web Dev', value: 400, color: 'hsl(var(--chart-1))' },
    { name: 'AI', value: 300, color: 'hsl(var(--chart-2))' },
    { name: 'Soft Skills', value: 300, color: 'hsl(var(--chart-3))' },
    { name: 'Data Sci', value: 200, color: 'hsl(var(--chart-4))' },
];


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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <div className="md:col-span-2 lg:col-span-4">
                     <Skeleton className="h-80 rounded-lg" />
                </div>
                <div className="md:col-span-2 lg:col-span-2">
                     <Skeleton className="h-80 rounded-lg" />
                </div>
                 <div className="md:col-span-2 lg:col-span-2">
                     <Skeleton className="h-80 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}!</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/"><Plus className="mr-2 h-4 w-4" /> Start a New Roadmap</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Roadmaps Created</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+3 since last month</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Explored</CardTitle>
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">84</div>
                   <p className="text-xs text-muted-foreground">+15 since last month</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">58%</div>
                  <p className="text-xs text-muted-foreground">+5% since last week</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Goal</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-xl font-bold">AI Engineering</div>
                   <p className="text-xs text-muted-foreground">Set 2 weeks ago</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Roadmaps</CardTitle>
            <CardDescription>Continue where you left off on your learning journeys.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {dummyRecentRoadmaps.map((roadmap) => (
                    <div key={roadmap.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                            <p className="font-semibold">{roadmap.title}</p>
                            <p className="text-sm text-muted-foreground">{roadmap.date}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/roadmap?query=${encodeURIComponent(roadmap.query)}`}>Revisit</Link>
                        </Button>
                    </div>
                ))}
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
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>A breakdown of the topics you've explored.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={topicsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return ( (percent as number) > 0.05 ?
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text> : null
                            );
                        }}>
                             {topicsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Learning Progress Overview</CardTitle>
                <CardDescription>Your estimated progress across different high-level skills.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={learningProgressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                        <Tooltip 
                            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                            contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                         />
                        <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
