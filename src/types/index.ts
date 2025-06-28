
export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: Omit<RoadmapNodeData, 'children'>[];
}

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface StoredRoadmap extends RoadmapNodeData {
  userId: string;
  query: string;
  nodeStatuses: Record<string, NodeStatus>;
  createdAt: string | Date; // Date from server, string after serialization
}
