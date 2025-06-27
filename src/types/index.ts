export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: Omit<RoadmapNodeData, 'children'>[];
}

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';
