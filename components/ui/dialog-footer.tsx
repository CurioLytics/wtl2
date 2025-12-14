import * as React from 'react';
import { cn } from '@/utils/ui';
import { Button } from '@/components/ui/button';

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Primary action button text
     */
    primaryText?: string;
    /**
     * Primary action handler
     */
    onPrimary?: () => void;
    /**
     * Secondary action button text
     */
    secondaryText?: string;
    /**
     * Secondary action handler
     */
    onSecondary?: () => void;
    /**
     * Whether primary button is loading
     */
    isLoading?: boolean;
    /**
     * Whether primary button is disabled
     */
    isPrimaryDisabled?: boolean;
    /**
     * Primary button variant
     */
    primaryVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    /**
     * Layout direction
     */
    layout?: 'horizontal' | 'vertical';
    /**
     * Custom children (overrides default buttons)
     */
    children?: React.ReactNode;
}

/**
 * Standardized Dialog Footer component with action buttons
 * 
 * @example
 * ```tsx
 * <DialogFooter
 *   primaryText="Save"
 *   onPrimary={handleSave}
 *   secondaryText="Cancel"
 *   onSecondary={() => setOpen(false)}
 *   isLoading={isSaving}
 * />
 * ```
 */
export function DialogFooter({
    primaryText,
    onPrimary,
    secondaryText,
    onSecondary,
    isLoading = false,
    isPrimaryDisabled = false,
    primaryVariant = 'default',
    layout = 'horizontal',
    className,
    children,
    ...props
}: DialogFooterProps) {
    // If custom children provided, just render them
    if (children) {
        return (
            <div
                className={cn(
                    'flex items-center border-t px-6 py-4',
                    layout === 'vertical' ? 'flex-col gap-2' : 'justify-end gap-3',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-center border-t px-6 py-4',
                layout === 'vertical' ? 'flex-col gap-2' : 'justify-end gap-3',
                className
            )}
            {...props}
        >
            {secondaryText && onSecondary && (
                <Button
                    variant="outline"
                    onClick={onSecondary}
                    disabled={isLoading}
                    className={layout === 'vertical' ? 'w-full' : ''}
                >
                    {secondaryText}
                </Button>
            )}

            {primaryText && onPrimary && (
                <Button
                    variant={primaryVariant}
                    onClick={onPrimary}
                    disabled={isPrimaryDisabled || isLoading}
                    className={layout === 'vertical' ? 'w-full' : ''}
                >
                    {isLoading ? 'Loading...' : primaryText}
                </Button>
            )}
        </div>
    );
}

export interface ConfirmDialogFooterProps extends Omit<DialogFooterProps, 'primaryVariant'> {
    /**
     * Confirm button text (defaults to "Confirm")
     */
    confirmText?: string;
    /**
     * Cancel button text (defaults to "Cancel")
     */
    cancelText?: string;
    /**
     * Whether this is a destructive action
     */
    destructive?: boolean;
}

/**
 * Dialog Footer for confirmation dialogs
 * 
 * @example
 * ```tsx
 * <ConfirmDialogFooter
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   onPrimary={handleDelete}
 *   onSecondary={() => setOpen(false)}
 *   destructive
 * />
 * ```
 */
export function ConfirmDialogFooter({
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onPrimary,
    onSecondary,
    ...props
}: ConfirmDialogFooterProps) {
    return (
        <DialogFooter
            primaryText={confirmText}
            secondaryText={cancelText}
            onPrimary={onPrimary}
            onSecondary={onSecondary}
            primaryVariant={destructive ? 'destructive' : 'default'}
            {...props}
        />
    );
}

export interface FormDialogFooterProps extends DialogFooterProps {
    /**
     * Submit button text (defaults to "Save")
     */
    submitText?: string;
    /**
     * Whether form is submitting
     */
    isSubmitting?: boolean;
    /**
     * Whether form is valid
     */
    isValid?: boolean;
}

/**
 * Dialog Footer for form dialogs
 * 
 * @example
 * ```tsx
 * <FormDialogFooter
 *   submitText="Save Changes"
 *   onPrimary={handleSubmit}
 *   onSecondary={() => setOpen(false)}
 *   isSubmitting={isSubmitting}
 *   isValid={isFormValid}
 * />
 * ```
 */
export function FormDialogFooter({
    submitText = 'Save',
    isSubmitting = false,
    isValid = true,
    onPrimary,
    onSecondary,
    ...props
}: FormDialogFooterProps) {
    return (
        <DialogFooter
            primaryText={submitText}
            secondaryText="Cancel"
            onPrimary={onPrimary}
            onSecondary={onSecondary}
            isLoading={isSubmitting}
            isPrimaryDisabled={!isValid}
            {...props}
        />
    );
}
