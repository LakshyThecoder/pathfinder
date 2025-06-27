"use client";

import { useState } from 'react';
import type { RoadmapNodeData } from '@/types';
import { getRoadmapData } from '@/lib/dummy-data';
import RoadmapTree from './RoadmapTree';
import Chatbot from './Chatbot';
import RoadmapControls from './RoadmapControls';

export default function RoadmapView({ query }: { query: string }) {
  const roadmapData = getRoadmapData(query);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  const handleNodeSelect = (node: RoadmapNodeData) => {
    setSelectedNode(node);
    setChatbotOpen(true);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
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
    </div>
  );
}
