'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History as HistoryIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import AuthWall from "@/components/AuthWall";
import { getHistoryAction } from '../actions';
import type { StoredRoadmap } from '@/types';

function HistoryLoading() {
  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <HistoryIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Roadmap History</h1>
        <p className="text-muted-foreground mt-2">Revisit and continue your learning journeys.</p>
      </div>
      <div className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
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
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<StoredRoadmap[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<StoredRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getHistoryAction().then(data => {
        if (!data.error) {
          setHistory(data.roadmaps as StoredRoadmap[]);
          setFilteredHistory(data.roadmaps as StoredRoadmap[]);
        }
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    const results = history.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(results);
  }, [searchTerm, history]);


  if (authLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <HistoryLoading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <AuthWall 
            title="Unlock Your History"
            description="Please log in or create an account to save and view your roadmap history. Your learning journeys will be waiting for you here."
        />
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
          <Input 
            placeholder="Search by keyword..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <HistoryLoading />
      ) : filteredHistory.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg hover:border-primary/50 transition-all flex flex-col">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Original query: "{item.query}"</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Created on: {new Date(item.createdAt?.toDate()).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                      <Link href={`/roadmap?id=${item.id}`}>Revisit Roadmap</Link>
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
