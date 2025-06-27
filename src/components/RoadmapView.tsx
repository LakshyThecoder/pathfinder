"use client";

import { useState, useEffect } from 'react';
import type { RoadmapNodeData } from '@/types';
import RoadmapTree from './RoadmapTree';
import Chatbot from './Chatbot';
import RoadmapControls from './RoadmapControls';
import { getAiRoadmap } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginPromptDialog from './LoginPromptDialog';

function RoadmapLoading() {
  return (
    <div className="p-8 w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Generating Your AI-Powered Roadmap...</h1>
        <p className="text-muted-foreground">Please wait a moment while we create your personalized learning path.</p>
      </div>
      <div className="p-8 w-full max-w-5xl">
        <Skeleton className="h-12 w-1/2 mx-auto mb-16" />
        <div className="flex justify-center items-start gap-16 lg:gap-24 px-4">
          <div className="flex flex-col items-center gap-8 min-w-[250px] w-full">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="hidden md:flex flex-col items-center gap-8 min-w-[250px] w-full">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="hidden lg:flex flex-col items-center gap-8 min-w-[250px] w-full">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapError({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center h-full p-4">
            <Alert variant="destructive" className="max-w-lg">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Generating Roadmap</AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default function RoadmapView({ query }: { query: string }) {
  const [roadmapData, setRoadmapData] = useState<RoadmapNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  useEffect(() => {
    setLoading(true);
    setError(null);
    setRoadmapData(null);

    async function fetchRoadmap() {
      const result = await getAiRoadmap({ query });
      if ('error' in result) {
        setError(result.error);
      } else {
        setRoadmapData(result);
      }
      setLoading(false);
    }

    if (query) {
      fetchRoadmap();
    }
  }, [query]);


  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    if (!user) {
        setLoginDialogOpen(true);
    } else {
        setChatbotOpen(true);
    }
  };

  if (loading) {
    return <RoadmapLoading />;
  }

  if (error) {
      return <RoadmapError message={error} />
  }

  if (!roadmapData) {
      return <RoadmapError message="No roadmap data was generated. Please try a different query." />
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div id="roadmap-container" className="h-full w-full bg-background">
        <RoadmapTree data={roadmapData} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNode?.id} />
      </div>
      <RoadmapControls query={query} roadmapTitle={roadmapData.title} />
      <Chatbot 
        isOpen={isChatbotOpen} 
        onOpenChange={setChatbotOpen} 
        selectedNode={selectedNode}
        query={query}
      />
      <LoginPromptDialog isOpen={isLoginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </div>
  );
}
