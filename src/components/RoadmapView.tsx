
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { RoadmapNodeData, NodeStatus, StoredRoadmap } from '@/types';
import RoadmapTree from './RoadmapTree';
import Chatbot from './Chatbot';
import RoadmapControls from './RoadmapControls';
import RoadmapProgress from './RoadmapProgress';
import { getAiRoadmap, getStoredRoadmap } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
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
  }, []);

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

export default function RoadmapView({ query, roadmapId }: { query?: string, roadmapId?: string }) {
  const [roadmapData, setRoadmapData] = useState<StoredRoadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const { user, loading: authLoading, sessionReady } = useAuth();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    async function fetchRoadmap() {
      setIsLoading(true);
      let result: StoredRoadmap | { error: string };
      
      if (roadmapId) {
        result = await getStoredRoadmap(roadmapId);
      } else if (query) {
        result = await getAiRoadmap(query);
      } else {
        router.push('/');
        return;
      }

      setIsLoading(false);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error Loading Roadmap',
          description: result.error,
        });
        router.push('/');
      } else {
        setRoadmapData(result);
        setNodeStatuses(result.nodeStatuses || {});
        
        if (query && result.id) {
          router.replace(`/roadmap?id=${result.id}`, { scroll: false });
        }
      }
    }

    // Guard 1: Wait for the auth library to settle its initial state.
    if (authLoading) {
      return; 
    }

    // After auth has loaded, decide what to do.
    if (query) {
      // For new roadmaps, we must have a user AND a ready server session.
      if (user && sessionReady) {
        fetchRoadmap();
      } else if (!user) {
        // If there's no user object, they are definitively logged out.
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You must be logged in to generate a new roadmap.',
        });
        router.push('/');
      }
      // If `user` exists but `sessionReady` is false, we do nothing and let the effect re-run when `sessionReady` changes.
    } else if (roadmapId) {
      // For existing roadmaps, we can always try to fetch. The server handles auth.
      fetchRoadmap();
    } else {
      // Invalid state: no query or ID.
      router.push('/');
    }
  }, [query, roadmapId, user, authLoading, sessionReady, toast, router]);


  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    setChatbotOpen(true);
  };

  const handleStatusChange = (nodeId: string, status: NodeStatus) => {
    setNodeStatuses(prev => ({
      ...prev,
      [nodeId]: status,
    }));
  };

  const { completedNodes, totalNodes, skippedNodes } = useMemo(() => {
    const statuses = Object.values(nodeStatuses);
    return {
      completedNodes: statuses.filter(s => s === 'completed').length,
      totalNodes: roadmapData?.children?.length ?? 0,
      skippedNodes: statuses.filter(s => s === 'skipped').length,
    };
  }, [nodeStatuses, roadmapData]);


  if (isLoading || !roadmapData) {
    return <RoadmapLoading />;
  }
  
  const isSaved = !!roadmapData.id;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div id="roadmap-container" className="h-full w-full bg-background">
        <RoadmapTree
          data={roadmapData}
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedNode?.id}
          nodeStatuses={nodeStatuses}
        />
      </div>
      <RoadmapProgress 
        totalNodes={totalNodes}
        completedNodes={completedNodes}
        skippedNodes={skippedNodes}
      />
      <RoadmapControls 
        roadmapTitle={roadmapData.title}
      />
      <Chatbot 
        isOpen={isChatbotOpen} 
        onOpenChange={setChatbotOpen} 
        selectedNode={selectedNode}
        onStatusChange={handleStatusChange}
        currentNodeStatus={selectedNode ? nodeStatuses[selectedNode.id] || 'not-started' : 'not-started'}
        roadmapId={isSaved ? roadmapData.id : undefined}
      />
    </div>
  );
}
