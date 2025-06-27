import { Suspense } from 'react';
import RoadmapView from '@/components/RoadmapView';
import PageLoading from '@/components/PageLoading';

function RoadmapPageLoading() {
  return (
    <PageLoading message="Preparing your roadmap..." />
  );
}

export default function RoadmapPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const { id } = searchParams;
  
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
      <Suspense fallback={<RoadmapPageLoading />}>
        <RoadmapView roadmapId={id} />
      </Suspense>
    </div>
  );
}
