import { Progress } from "@/components/ui/progress";

interface RoadmapProgressProps {
    totalNodes: number;
    completedNodes: number;
    skippedNodes: number;
}

export default function RoadmapProgress({ totalNodes, completedNodes, skippedNodes }: RoadmapProgressProps) {
    const trackableNodes = totalNodes - skippedNodes;
    const percentage = trackableNodes > 0 ? Math.round((completedNodes / trackableNodes) * 100) : 0;

    return (
        <div className="absolute top-6 left-6 z-20 w-64 p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold">Roadmap Progress</h3>
                <p className="text-sm font-bold text-primary">{percentage}%</p>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
                {completedNodes} of {trackableNodes} steps completed
            </p>
        </div>
    );
}
