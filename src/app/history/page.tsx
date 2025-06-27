"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History as HistoryIcon, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const dummyHistory = [
  { id: 1, title: "My UI/UX Journey", query: "UI/UX Design", date: "2023-10-26" },
  { id: 2, title: "Python for Data Science", query: "Python", date: "2023-10-22" },
  { id: 3, title: "Startup Basics", query: "Entrepreneurship", date: "2023-10-20" },
];

function AuthWall() {
  return (
    <div className="w-full text-center py-16 flex flex-col items-center">
      <Lock className="h-16 w-16 text-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">Unlock Your History</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Please log in or create an account to save and view your roadmap history. Your learning journeys will be waiting for you here.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}

function HistoryLoading() {
  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}


export default function HistoryPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <HistoryLoading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <AuthWall />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <HistoryIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Roadmap History</h1>
        <p className="text-muted-foreground mt-2">Revisit and continue your learning journeys.</p>
      </div>
      <div className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by keyword..." className="pl-10" />
        </div>
        <Button>Search</Button>
      </div>
      {dummyHistory.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dummyHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg hover:border-primary/50 transition-all flex flex-col">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Original query: "{item.query}"</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Created on: {new Date(item.date).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                      <Link href={`/roadmap?query=${encodeURIComponent(item.query)}`}>Revisit Roadmap</Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No History Found</h2>
            <p className="text-muted-foreground mt-2 mb-4">You haven't generated any roadmaps yet.</p>
            <Button asChild>
                <Link href="/">Start a New Roadmap</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
