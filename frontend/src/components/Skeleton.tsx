import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
};

interface SkeletonListProps {
    count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 p-4 glass-card rounded-xl"
                >
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
            ))}
        </div>
    );
};

interface SkeletonCardProps {
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
    return (
        <div className={`glass-card rounded-xl p-4 space-y-3 ${className}`}>
            <div className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
};

interface SkeletonGridProps {
    count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};
