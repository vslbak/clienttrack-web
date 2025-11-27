import { Loader2 } from 'lucide-react';

interface LoaderSpinnerProps {
  message?: string;
}

export function LoaderSpinner({ message = 'Loading...' }: LoaderSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
