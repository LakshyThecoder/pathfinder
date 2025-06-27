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
    <div className="relative h-[calc(100vh-4rem)]">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
      <Suspense fallback={<RoadmapLoading />}>
        <RoadmapView query={query} />
      </Suspense>
    </div>
  );
}
