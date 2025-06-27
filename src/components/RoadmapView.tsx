"use client";

import { useState, useEffect } from 'react';
import type { RoadmapNodeData } from '@/types';
import RoadmapTree from './RoadmapTree';
import Chatbot from './Chatbot';
import RoadmapControls from './RoadmapControls';
import { getAiRoadmap } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import LoginPromptDialog from './LoginPromptDialog';
import { useToast } from '@/hooks/use-toast';

function RoadmapLoading() {
  const loadingMessages = [
    "Consulting with AI experts...",
    "Drawing the map to your success...",
    "Assembling the building blocks of knowledge...",
    "Plotting the course for your adventure...",
    "Turning your goal into a grand plan...",
  ];
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [loadingMessages]);

  return (
    <div className="p-8 w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Generating Your AI-Powered Roadmap...</h1>
        <p className="text-muted-foreground h-5">{message}</p>
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

export default function RoadmapView({ query }: { query: string }) {
  const [roadmapData, setRoadmapData] = useState<RoadmapNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();


  useEffect(() => {
    setRoadmapData(null);
    setIsLoading(true);

    async function fetchRoadmap() {
      const result = await getAiRoadmap({ query });
      setIsLoading(false);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error Generating Roadmap',
          description: result.error,
        });
      } else {
        setRoadmapData(result);
      }
    }

    if (query) {
      fetchRoadmap();
    }
  }, [query, toast]);


  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    if (!user) {
        setLoginDialogOpen(true);
    } else {
        setChatbotOpen(true);
    }
  };

  if (isLoading || !roadmapData) {
    return <RoadmapLoading />;
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
