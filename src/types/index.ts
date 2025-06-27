export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: RoadmapNodeData[];
}

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';
