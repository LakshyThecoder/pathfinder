
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { StoredRoadmap, RoadmapNodeData, NodeStatus } from '@/types';
import RoadmapTree from './RoadmapTree';
import Chatbot from './Chatbot';
import RoadmapControls from './RoadmapControls';
import RoadmapProgress from './RoadmapProgress';
import { useToast } from '@/hooks/use-toast';
import PageLoading from '@/components/PageLoading';
import { getRoadmapAction, updateNodeStatusAction } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';

export default function RoadmapView({ roadmapId }: { roadmapId?: string }) {
  const [roadmapData, setRoadmapData] = useState<StoredRoadmap | RoadmapNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to be determined before doing anything.
      return;
    }

    if (!roadmapId) {
      toast({
        title: 'No Roadmap ID',
        description: 'Please generate a roadmap from the home page.',
        variant: 'destructive'
      })
      router.push('/');
      return;
    }
    
    setIsLoading(true);

    const loadRoadmap = async () => {
      // Logged-in users first attempt to fetch from DB.
      if (user) {
        const result = await getRoadmapAction(roadmapId);
        if (!('error' in result)) {
          setRoadmapData(result);
          setNodeStatuses(result.nodeStatuses || {});
          setIsLoading(false);
          return;
        }
        // If it fails (e.g., not their roadmap), we fall through to check session storage.
      }

      // Guest users, or logged-in users who failed the DB fetch, check session storage.
      const tempRoadmapJSON = sessionStorage.getItem(`temp_roadmap_${roadmapId}`);
      if (tempRoadmapJSON) {
          try {
              const tempRoadmap = JSON.parse(tempRoadmapJSON);
              setRoadmapData(tempRoadmap);
              const localStatuses = JSON.parse(localStorage.getItem(`statuses_${roadmapId}`) || '{}');
              setNodeStatuses(localStatuses);
              setIsLoading(false);
          } catch (error) {
              console.error("Failed to parse roadmap from session storage", error);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not load temporary roadmap.' });
              router.push('/');
          }
      } else {
        // If nothing is found anywhere, it's an error.
        toast({
            variant: 'destructive',
            title: 'Error Loading Roadmap',
            description: "Could not find this roadmap. It may have expired or never existed.",
        });
        router.push('/history');
      }
    }
    
    loadRoadmap();

  }, [roadmapId, router, toast, user, authLoading]);

  const handleStatusChange = useCallback(async (nodeId: string, status: NodeStatus) => {
    const newStatuses = { ...nodeStatuses, [nodeId]: status };
    setNodeStatuses(newStatuses);

    // If logged in and it's a saved roadmap, update the database.
    if (user && roadmapId && roadmapData && 'userId' in roadmapData) {
      const result = await updateNodeStatusAction(roadmapId, nodeId, status);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Failed to save progress',
          description: result.error,
        });
        setNodeStatuses(nodeStatuses); // Revert on failure
      }
    } else if (roadmapId) {
      // If not logged in, save progress to local storage for persistence on this device.
      localStorage.setItem(`statuses_${roadmapId}`, JSON.stringify(newStatuses));
    }
  }, [nodeStatuses, roadmapId, toast, roadmapData, user]);

  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    setChatbotOpen(true);
  };

  const { completedNodes, totalNodes, skippedNodes } = useMemo(() => {
    const statuses = Object.values(nodeStatuses);
    return {
      completedNodes: statuses.filter(s => s === 'completed').length,
      totalNodes: roadmapData?.children?.length ?? 0,
      skippedNodes: statuses.filter(s => s === 'skipped').length,
    };
  }, [nodeStatuses, roadmapData]);

  if (isLoading || authLoading || !roadmapData) {
    return <PageLoading message="Loading your roadmap..." />;
  }
  
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
      />
    </div>
  );
}
