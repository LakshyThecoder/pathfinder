
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
        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-auto md:w-64 z-20 p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg">
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
