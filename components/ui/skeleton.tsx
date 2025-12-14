import * as React from 'react';
import { cn } from '@/utils/ui';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Width of the skeleton (CSS value)
     */
    width?: string | number;
    /**
     * Height of the skeleton (CSS value)
     */
    height?: string | number;
    /**
     * Shape variant
     */
    variant?: 'text' | 'circular' | 'rectangular';
    /**
     * Animation type
     */
    animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component for loading states
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, width, height, variant = 'rectangular', animation = 'pulse', style, ...props }, ref) => {
        const variantClasses = {
            text: 'rounded',
            circular: 'rounded-full',
            rectangular: 'rounded-lg',
        };

        const animationClasses = {
            pulse: 'animate-pulse',
            wave: 'animate-shimmer',
            none: '',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-gray-200',
                    variantClasses[variant],
                    animationClasses[animation],
                    className
                )}
                style={{
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    ...style,
                }}
                {...props}
            />
        );
    }
);
Skeleton.displayName = 'Skeleton';

interface SkeletonCardProps {
    /**
     * Number of lines to show
     */
    lines?: number;
    /**
     * Show avatar
     */
    showAvatar?: boolean;
    /**
     * Show image
     */
    showImage?: boolean;
    /**
     * Additional className
     */
    className?: string;
}

/**
 * Skeleton Card component for loading card states
 * 
 * @example
 * ```tsx
 * <SkeletonCard lines={3} showAvatar />
 * ```
 */
export function SkeletonCard({
    lines = 3,
    showAvatar = false,
    showImage = false,
    className
}: SkeletonCardProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-gray-200 p-4 space-y-3', className)}>
            {showImage && (
                <Skeleton height={160} className="w-full" />
            )}

            <div className="space-y-3">
                {showAvatar && (
                    <div className="flex items-center gap-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div className="flex-1 space-y-2">
                            <Skeleton height={16} width="60%" />
                            <Skeleton height={12} width="40%" />
                        </div>
                    </div>
                )}

                {!showAvatar && (
                    <Skeleton height={20} width="70%" />
                )}

                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        height={12}
                        width={i === lines - 1 ? '80%' : '100%'}
                    />
                ))}
            </div>
        </div>
    );
}

interface SkeletonListProps {
    /**
     * Number of items to show
     */
    count?: number;
    /**
     * Props for each skeleton card
     */
    cardProps?: Omit<SkeletonCardProps, 'className'>;
    /**
     * Additional className
     */
    className?: string;
}

/**
 * Skeleton List component for loading list states
 * 
 * @example
 * ```tsx
 * <SkeletonList count={5} cardProps={{ lines: 2, showAvatar: true }} />
 * ```
 */
export function SkeletonList({ count = 3, cardProps, className }: SkeletonListProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} {...cardProps} />
            ))}
        </div>
    );
}

interface SkeletonTextProps {
    /**
     * Number of lines
     */
    lines?: number;
    /**
     * Additional className
     */
    className?: string;
}

/**
 * Skeleton Text component for loading text content
 * 
 * @example
 * ```tsx
 * <SkeletonText lines={4} />
 * ```
 */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    height={14}
                    width={i === lines - 1 ? '75%' : '100%'}
                />
            ))}
        </div>
    );
}
