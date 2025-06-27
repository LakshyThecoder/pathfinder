export interface RoadmapNodeData {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: RoadmapNodeData[];
}
