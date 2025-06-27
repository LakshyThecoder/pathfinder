import { Suspense } from 'react';
import RoadmapView from '@/components/RoadmapView';
import { Skeleton } from '@/components/ui/skeleton';

function RoadmapLoading() {
  return (
    <div className="p-8 w-full">
      <Skeleton className="h-16 w-1/2 mx-auto mb-12" />
      <div className="flex justify-center items-start gap-16 lg:gap-24 px-4">
        <div className="flex flex-col items-center gap-8 min-w-[250px]">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col items-center gap-8 min-w-[250px]">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col items-center gap-8 min-w-[250px]">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || 'UI/UX Design';
  
  return (
    <Suspense fallback={<RoadmapLoading />}>
      <RoadmapView query={query} />
    </Suspense>
  );
}
