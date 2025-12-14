import * as React from 'react';
import { cn } from '@/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
    'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
    {
        variants: {
            size: {
                sm: 'h-4 w-4 border-2',
                md: 'h-8 w-8 border-2',
                lg: 'h-12 w-12 border-3',
                xl: 'h-16 w-16 border-4',
            },
            variant: {
                default: 'text-gray-600',
                primary: 'text-blue-600',
                secondary: 'text-gray-400',
                success: 'text-green-600',
                warning: 'text-yellow-600',
                danger: 'text-red-600',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    /**
     * Text to display below the spinner
     */
    text?: string;
    /**
     * Center the spinner
     */
    centered?: boolean;
}

/**
 * Loading Spinner component
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading..." />
 * ```
 */
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ className, size, variant, text, centered = false, ...props }, ref) => {
        const content = (
            <>
                <div
                    className={cn(spinnerVariants({ size, variant }), className)}
                    role="status"
                    aria-label="Loading"
                >
                    <span className="sr-only">Loading...</span>
                </div>
                {text && (
                    <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
                )}
            </>
        );

        if (centered) {
            return (
                <div
                    ref={ref}
                    className="flex flex-col items-center justify-center"
                    {...props}
                >
                    {content}
                </div>
            );
        }

        return (
            <div ref={ref} className="inline-flex flex-col items-center" {...props}>
                {content}
            </div>
        );
    }
);
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingOverlayProps {
    /**
     * Whether the overlay is visible
     */
    isLoading: boolean;
    /**
     * Loading text
     */
    text?: string;
    /**
     * Spinner size
     */
    size?: VariantProps<typeof spinnerVariants>['size'];
    /**
     * Children to render (will be dimmed when loading)
     */
    children?: React.ReactNode;
}

/**
 * Loading Overlay component - shows a loading spinner over content
 * 
 * @example
 * ```tsx
 * <LoadingOverlay isLoading={isLoading} text="Saving...">
 *   <YourContent />
 * </LoadingOverlay>
 * ```
 */
export function LoadingOverlay({
    isLoading,
    text,
    size = 'lg',
    children
}: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                    <LoadingSpinner size={size} text={text} centered />
                </div>
            )}
        </div>
    );
}

interface LoadingDotsProps {
    /**
     * Size of the dots
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: VariantProps<typeof spinnerVariants>['variant'];
    /**
     * Additional className
     */
    className?: string;
}

/**
 * Loading Dots component - animated dots for inline loading states
 * 
 * @example
 * ```tsx
 * <LoadingDots size="sm" variant="primary" />
 * ```
 */
export function LoadingDots({ size = 'md', variant = 'default', className }: LoadingDotsProps) {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    const colorClasses = {
        default: 'bg-gray-600',
        primary: 'bg-blue-600',
        secondary: 'bg-gray-400',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full animate-bounce',
                        sizeClasses[size],
                        colorClasses[variant || 'default']
                    )}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.6s',
                    }}
                />
            ))}
        </div>
    );
}

interface LoadingBarProps {
    /**
     * Progress percentage (0-100)
     */
    progress?: number;
    /**
     * Whether to show indeterminate animation
     */
    indeterminate?: boolean;
    /**
     * Color variant
     */
    variant?: VariantProps<typeof spinnerVariants>['variant'];
    /**
     * Additional className
     */
    className?: string;
}

/**
 * Loading Bar component - progress bar for loading states
 * 
 * @example
 * ```tsx
 * <LoadingBar progress={75} variant="primary" />
 * <LoadingBar indeterminate variant="primary" />
 * ```
 */
export function LoadingBar({
    progress = 0,
    indeterminate = false,
    variant = 'primary',
    className
}: LoadingBarProps) {
    const colorClasses = {
        default: 'bg-gray-600',
        primary: 'bg-blue-600',
        secondary: 'bg-gray-400',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
    };

    return (
        <div className={cn('w-full h-1 bg-gray-200 rounded-full overflow-hidden', className)}>
            <div
                className={cn(
                    'h-full transition-all duration-300',
                    colorClasses[variant || 'primary'],
                    indeterminate && 'animate-[loading-bar_1.5s_ease-in-out_infinite]'
                )}
                style={{
                    width: indeterminate ? '30%' : `${Math.min(100, Math.max(0, progress))}%`,
                }}
            />
        </div>
    );
}
