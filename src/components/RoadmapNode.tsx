"use client";

import type { RoadmapNodeData } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface RoadmapNodeProps {
  node: RoadmapNodeData;
  onNodeSelect: (node: RoadmapNodeData) => void;
  isSelected: boolean;
}

export default function RoadmapNode({ node, onNodeSelect, isSelected }: RoadmapNodeProps) {
  return (
    <motion.div
      onClick={() => onNodeSelect(node)}
      className={cn(
        'relative z-10 w-[220px] min-h-[100px] p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border-2 flex items-center justify-center',
        'bg-card text-card-foreground',
        isSelected ? 'border-primary scale-105 shadow-primary/20' : 'border-border hover:border-accent'
      )}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      layoutId={`roadmap-node-${node.id}`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNodeSelect(node)}
    >
      <Badge variant={isSelected ? 'default' : 'secondary'} className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2")}>
        {node.level}
      </Badge>
      <h3 className="font-semibold text-center text-base">{node.title}</h3>
    </motion.div>
  );
}
