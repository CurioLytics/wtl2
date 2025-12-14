import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/ui';
import { DialogTitle } from '@/components/ui/dialog';

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Dialog title
     */
    title?: string;
    /**
     * Show close button
     */
    showClose?: boolean;
    /**
     * Close button click handler
     */
    onClose?: () => void;
    /**
     * Additional content to render in header
     */
    children?: React.ReactNode;
}

/**
 * Standardized Dialog Header component
 * 
 * @example
 * ```tsx
 * <DialogHeader 
 *   title="Edit Profile" 
 *   showClose 
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function StandardDialogHeader({
    title,
    showClose = true,
    onClose,
    className,
    children,
    ...props
}: DialogHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between border-b px-6 py-4',
                className
            )}
            {...props}
        >
            <div className="flex-1">
                {title && (
                    <DialogTitle className="text-xl font-semibold">
                        {title}
                    </DialogTitle>
                )}
                {children}
            </div>

            {showClose && onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            )}
        </div>
    );
}

export interface DialogHeaderWithBadgeProps extends DialogHeaderProps {
    /**
     * Badge text
     */
    badge?: string;
    /**
     * Badge variant
     */
    badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Dialog Header with Badge component
 * 
 * @example
 * ```tsx
 * <DialogHeaderWithBadge 
 *   title="Premium Feature" 
 *   badge="PRO"
 *   badgeVariant="primary"
 * />
 * ```
 */
export function DialogHeaderWithBadge({
    title,
    badge,
    badgeVariant = 'default',
    showClose = true,
    onClose,
    className,
    children,
    ...props
}: DialogHeaderWithBadgeProps) {
    const badgeClasses = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-blue-100 text-blue-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
    };

    return (
        <div
            className={cn(
                'flex items-center justify-between border-b px-6 py-4',
                className
            )}
            {...props}
        >
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    {badge && (
                        <span
                            className={cn(
                                'inline-block px-2 py-1 text-xs font-semibold rounded-full',
                                badgeClasses[badgeVariant]
                            )}
                        >
                            {badge}
                        </span>
                    )}
                    {title && (
                        <DialogTitle className="text-xl font-semibold">
                            {title}
                        </DialogTitle>
                    )}
                </div>
                {children}
            </div>

            {showClose && onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            )}
        </div>
    );
}
