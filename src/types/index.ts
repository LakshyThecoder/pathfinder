import type { Timestamp } from "firebase/firestore";

export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: Omit<RoadmapNodeData, 'children'>[];
}

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

// This is the shape for both unsaved and saved roadmaps.
// On the client, `createdAt` will be a string if it exists.
// In Firestore, it's a Timestamp.
// When a roadmap is first generated and not yet saved, `createdAt` will be undefined.
export interface StoredRoadmap extends RoadmapNodeData {
    userId: string;
    query: string;
    nodeStatuses: Record<string, NodeStatus>;
    createdAt?: Timestamp | string;
}
