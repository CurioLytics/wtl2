import * as React from 'react';
import { cn } from '@/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyStateVariants = cva(
    'flex flex-col items-center justify-center text-center p-8',
    {
        variants: {
            size: {
                sm: 'py-6',
                md: 'py-8',
                lg: 'py-12',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

export interface EmptyStateProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
    /**
     * Icon or emoji to display
     */
    icon?: React.ReactNode;
    /**
     * Title text
     */
    title: string;
    /**
     * Description text
     */
    description?: string;
    /**
     * Action button or element
     */
    action?: React.ReactNode;
}

/**
 * Empty State component for displaying when there's no data
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📝"
 *   title="No Journal Entries Yet"
 *   description="Start your writing journey with a new journal entry."
 *   action={<Button>Create Journal</Button>}
 * />
 * ```
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, size, icon, title, description, action, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(emptyStateVariants({ size }), className)}
                {...props}
            >
                {icon && (
                    <div className="mb-4 text-5xl opacity-50">
                        {typeof icon === 'string' ? icon : icon}
                    </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-gray-600 max-w-md mb-6">
                        {description}
                    </p>
                )}

                {action && (
                    <div className="mt-4">
                        {action}
                    </div>
                )}
            </div>
        );
    }
);
EmptyState.displayName = 'EmptyState';

interface EmptyStateCardProps extends EmptyStateProps {
    /**
     * Show border
     */
    bordered?: boolean;
}

/**
 * Empty State Card - Empty state with card styling
 * 
 * @example
 * ```tsx
 * <EmptyStateCard
 *   icon="🗂️"
 *   title="No Templates"
 *   description="Create your first template to get started."
 *   bordered
 * />
 * ```
 */
export function EmptyStateCard({
    bordered = true,
    className,
    ...props
}: EmptyStateCardProps) {
    return (
        <EmptyState
            className={cn(
                'bg-gray-50 rounded-lg',
                bordered && 'border-2 border-dashed border-gray-300',
                className
            )}
            {...props}
        />
    );
}

interface EmptySearchResultsProps {
    /**
     * Search query
     */
    query?: string;
    /**
     * Additional className
     */
    className?: string;
    /**
     * Action button
     */
    action?: React.ReactNode;
}

/**
 * Empty Search Results - Specialized empty state for search
 * 
 * @example
 * ```tsx
 * <EmptySearchResults query="test" />
 * ```
 */
export function EmptySearchResults({
    query,
    className,
    action
}: EmptySearchResultsProps) {
    return (
        <EmptyState
            icon="🔍"
            title={query ? `No results for "${query}"` : 'No results found'}
            description="Try adjusting your search terms or filters."
            action={action}
            className={className}
        />
    );
}

interface EmptyListProps {
    /**
     * Type of items in the list
     */
    itemType: string;
    /**
     * Icon or emoji
     */
    icon?: React.ReactNode;
    /**
     * Additional className
     */
    className?: string;
    /**
     * Action button
     */
    action?: React.ReactNode;
}

/**
 * Empty List - Generic empty state for lists
 * 
 * @example
 * ```tsx
 * <EmptyList
 *   itemType="journals"
 *   icon="📝"
 *   action={<Button>Create Journal</Button>}
 * />
 * ```
 */
export function EmptyList({
    itemType,
    icon = '📋',
    className,
    action
}: EmptyListProps) {
    return (
        <EmptyState
            icon={icon}
            title={`No ${itemType} yet`}
            description={`Get started by creating your first ${itemType.toLowerCase()}.`}
            action={action}
            className={className}
        />
    );
}
