import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 gradient-border animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-12 rounded-lg" />
      </div>

      {/* Looking For */}
      <div className="mb-4">
        <Skeleton className="h-3 w-20 mb-2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      {/* CTA */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 gradient-border animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* Skills */}
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      {/* Looking For */}
      <Skeleton className="h-4 w-40 mb-4" />

      {/* CTA */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function CardGridSkeleton({ count = 4, type = "project" }: { count?: number; type?: "project" | "person" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        type === "project" 
          ? <ProjectCardSkeleton key={i} />
          : <PersonCardSkeleton key={i} />
      ))}
    </div>
  );
}
