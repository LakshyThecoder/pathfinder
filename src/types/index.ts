import type { Timestamp } from "firebase/firestore";

export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: Omit<RoadmapNodeData, 'children'>[];
}

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

// This is what will be stored in Firestore
export interface StoredRoadmap extends RoadmapNodeData {
    userId: string;
    query: string;
    nodeStatuses: Record<string, NodeStatus>;
    createdAt: Timestamp;
}
