"use client";

import type { RoadmapNodeData } from '@/types';
import RoadmapNode from './RoadmapNode';
import { ArrowRight } from 'lucide-react';

interface RoadmapTreeProps {
  data: RoadmapNodeData;
  onNodeSelect: (node: RoadmapNodeData) => void;
  selectedNodeId?: string;
}

const TreeColumn = ({ nodes, onNodeSelect, selectedNodeId, title }: { nodes: RoadmapNodeData[], onNodeSelect: (node: RoadmapNodeData) => void; selectedNodeId?: string, title: string }) => {
  return (
    <div className="flex flex-col items-center gap-8 min-w-[250px]">
       <h2 className="text-2xl font-semibold text-muted-foreground">{title}</h2>
       <div className="flex flex-col items-center gap-12 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border -translate-x-1/2 h-full -z-10" />
        {nodes.map(node => (
            <RoadmapNode key={node.id} node={node} onNodeSelect={onNodeSelect} isSelected={selectedNodeId === node.id} />
        ))}
       </div>
    </div>
  )
}

export default function RoadmapTree({ data, onNodeSelect, selectedNodeId }: RoadmapTreeProps) {
    // Group children by level for columnar layout
    const levels: Record<string, RoadmapNodeData[]> = {
        'Beginner': [],
        'Intermediate': [],
        'Advanced': [],
    };

    const categorizeNodes = (nodes: RoadmapNodeData[]) => {
        nodes.forEach(node => {
            if (levels[node.level]) {
                levels[node.level].push(node);
            }
            if (node.children) {
                categorizeNodes(node.children);
            }
        })
    }
    
    if (data.children) {
        categorizeNodes(data.children);
    }
    
    const filledLevels = Object.entries(levels).filter(([, nodes]) => nodes.length > 0);

  return (
    <div className="p-8 h-full w-full overflow-auto">
        <h1 className="text-4xl font-bold mb-16 text-center text-foreground capitalize">{data.title}</h1>
        <div className="flex justify-center items-start gap-8 lg:gap-16 px-4">
           {filledLevels.map(([level, nodes], index) => (
                <div key={level} className="flex items-center">
                    <TreeColumn title={level} nodes={nodes} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} />
                    {index < filledLevels.length - 1 && 
                        <ArrowRight className="h-12 w-12 text-border mx-4 lg:mx-8" />
                    }
                </div>
           ))}
        </div>
    </div>
  );
}
