import { Suspense } from 'react';
import RoadmapView from '@/components/RoadmapView';
import { Skeleton } from '@/components/ui/skeleton';

function RoadmapPageLoading() {
  return (
    <div className="p-8 w-full flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Preparing the launchpad...</h1>
        <p className="text-muted-foreground">Your AI-powered roadmap is moments away.</p>
      </div>
    </div>
  );
}

export default function RoadmapPage({
  searchParams,
}: {
  searchParams: { query?: string; id?: string };
}) {
  const { query, id } = searchParams;
  
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
      <Suspense fallback={<RoadmapPageLoading />}>
        <RoadmapView query={query} roadmapId={id} />
      </Suspense>
    </div>
  );
}
