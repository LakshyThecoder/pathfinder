import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold tracking-tight">Just a moment</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
