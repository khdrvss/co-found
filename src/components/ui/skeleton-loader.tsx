import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    );
}

export function ProjectCardSkeleton() {
    return (
        <div className="glass rounded-2xl p-5 border border-border/50">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-24 bg-primary/10" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Owner */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
            </div>

            {/* Looking For */}
            <div className="mb-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                </div>
            </div>

            {/* CTA */}
            <Skeleton className="h-11 w-full rounded-xl" />
        </div>
    );
}

export function PersonCardSkeleton() {
    return (
        <div className="glass rounded-2xl p-5 border border-border/50 flex flex-col items-center text-center">
            {/* Avatar */}
            <Skeleton className="w-20 h-20 rounded-full mb-3" />

            {/* Name & Role */}
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24 mb-3" />

            {/* Status Badge */}
            <Skeleton className="h-5 w-24 rounded-full mb-4" />

            {/* Divider */}
            <div className="w-full h-px bg-border/50 my-2" />

            {/* Skills */}
            <div className="w-full flex justify-center gap-1 flex-wrap mt-2 mb-4">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
            </div>

            {/* CTA */}
            <Skeleton className="h-9 w-full rounded-lg mt-auto" />
        </div>
    );
}
