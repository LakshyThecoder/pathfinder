
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

export default function RoadmapView({ roadmapId }: { roadmapId?: string }) {
  const [roadmapData, setRoadmapData] = useState<StoredRoadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    const fetchRoadmap = async () => {
      const result = await getRoadmapAction(roadmapId);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error Loading Roadmap',
          description: result.error,
        });
        router.push('/history');
      } else {
        setRoadmapData(result);
        setNodeStatuses(result.nodeStatuses || {});
      }
      setIsLoading(false);
    }
    fetchRoadmap();

  }, [roadmapId, router, toast]);

  const handleStatusChange = useCallback(async (nodeId: string, status: NodeStatus) => {
    const newStatuses = {
      ...nodeStatuses,
      [nodeId]: status,
    };
    setNodeStatuses(newStatuses);
    if (roadmapId) {
      const result = await updateNodeStatusAction(roadmapId, nodeId, status);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Failed to update status',
          description: result.error,
        });
        // Optionally revert state
      }
    }
  }, [nodeStatuses, roadmapId, toast]);

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

  if (isLoading || !roadmapData) {
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
