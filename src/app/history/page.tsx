
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History as HistoryIcon, HardDrive } from "lucide-react";
import Link from "next/link";
import PageLoading from '@/components/PageLoading';
import type { StoredRoadmap } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<Partial<StoredRoadmap>[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Partial<StoredRoadmap>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // This effect runs once on mount to load history exclusively from localStorage.
    setLoading(true);
    try {
      const localHistoryJson = localStorage.getItem('local_roadmap_history');
      const localHistory = localHistoryJson ? JSON.parse(localHistoryJson) : [];
      setHistory(localHistory);
    } catch (e) {
      console.error("Failed to parse local history", e);
      setHistory([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    // This effect filters the history whenever the search term or the base history changes.
    const results = history.filter(item =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.query && item.query.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredHistory(results);
  }, [searchTerm, history]);

  const descriptionText = "Your recently generated roadmaps, saved directly in this browser.";
  const emptyText = "Roadmaps you create will be saved here in your browser.";

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <HistoryIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Roadmap History</h1>
        <p className="text-muted-foreground mt-2 max-w-xl flex items-center justify-center gap-2">
            <HardDrive className="h-4 w-4" /> {descriptionText}
        </p>
         <p className="text-sm text-muted-foreground mt-2">
            <Link href="/login" className="underline hover:text-primary">Log in</Link> to save your history to your account and access it anywhere.
        </p>
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
        <PageLoading message="Loading history from your browser..."/>
      ) : filteredHistory.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg hover:border-primary/50 transition-all flex flex-col">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                {item.query && <CardDescription>Original query: "{item.query}"</CardDescription>}
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
                : emptyText
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
