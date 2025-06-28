
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import PageLoading from '@/components/PageLoading';

interface HistoryItem {
  id: string;
  title: string;
  query: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const storedHistory = localStorage.getItem('roadmap-history');
    if (storedHistory) {
      try {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistory);
        // Sort by date just in case, newest first
        parsedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(parsedHistory);
        setFilteredHistory(parsedHistory);
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        setHistory([]);
        setFilteredHistory([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const results = history.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.query && item.query.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredHistory(results);
  }, [searchTerm, history]);


  if (loading) {
     return (
        <div className="container mx-auto py-10 px-4">
            <PageLoading message="Loading your roadmap history..." />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <HistoryIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Roadmap History</h1>
        <p className="text-muted-foreground mt-2">Revisit your learning journeys.</p>
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
      {filteredHistory.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg hover:border-primary/50 transition-all flex flex-col">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Original query: "{item.query}"</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 {item.createdAt && (
                    <p className="text-sm text-muted-foreground">Created on: {new Date(item.createdAt).toLocaleDateString()}</p>
                )}
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
            <h2 className="text-xl font-semibold">
                {searchTerm ? 'No Results Found' : 'No History Found'}
            </h2>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchTerm 
                ? "No roadmaps match your search criteria."
                : "You haven't generated any roadmaps yet."
              }
            </p>
            {!searchTerm && (
                <Button asChild>
                    <Link href="/">Start a New Roadmap</Link>
                </Button>
            )}
        </div>
      )}
    </div>
  );
}
