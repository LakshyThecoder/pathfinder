"use client";

import type { RoadmapNodeData, NodeStatus } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';

interface RoadmapNodeProps {
  node: RoadmapNodeData;
  onNodeSelect: (node: RoadmapNodeData) => void;
  isSelected: boolean;
  status: NodeStatus;
}

const statusConfig = {
    'completed': {
        icon: CheckCircle2,
        className: 'border-green-500/80 bg-green-500/10 hover:border-green-500',
        iconClass: 'text-green-500'
    },
    'in-progress': {
        icon: CircleDashed,
        className: 'border-blue-500/80 bg-blue-500/10 hover:border-blue-500',
        iconClass: 'text-blue-500 animate-spin'
    },
    'skipped': {
        icon: XCircle,
        className: 'border-muted bg-muted/50 opacity-60 hover:opacity-100',
        iconClass: 'text-muted-foreground'
    },
    'not-started': {
        icon: null,
        className: 'border-border hover:border-accent',
        iconClass: ''
    }
}

export default function RoadmapNode({ node, onNodeSelect, isSelected, status }: RoadmapNodeProps) {
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      onClick={() => onNodeSelect(node)}
      className={cn(
        'relative z-10 w-[220px] min-h-[100px] p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border-2 flex items-center justify-center',
        'bg-card text-card-foreground',
        isSelected ? 'border-primary scale-105 shadow-primary/20' : currentStatus.className
      )}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      layoutId={`roadmap-node-${node.id}`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNodeSelect(node)}
    >
      {StatusIcon && (
          <div className="absolute top-2 right-2">
            <StatusIcon className={cn('h-5 w-5', currentStatus.iconClass)} />
          </div>
      )}
      <Badge variant={isSelected ? 'default' : 'secondary'} className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2")}>
        {node.level}
      </Badge>
      <h3 className="font-semibold text-center text-base">{node.title}</h3>
    </motion.div>
  );
}
