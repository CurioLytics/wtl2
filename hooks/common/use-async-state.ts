import { useState, useCallback } from 'react';

/**
 * State for async operations
 */
export interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Actions for managing async state
 */
export interface AsyncActions<T> {
    setData: (data: T) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    reset: () => void;
    execute: (asyncFn: () => Promise<T>) => Promise<void>;
}

/**
 * Custom hook for managing async state (loading, error, data)
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsyncState<User[]>();
 * 
 * useEffect(() => {
 *   execute(() => fetchUsers());
 * }, []);
 * ```
 */
export function useAsyncState<T = any>(
    initialData: T | null = null
): AsyncState<T> & AsyncActions<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        isLoading: false,
        error: null,
    });

    const setData = useCallback((data: T) => {
        setState(prev => ({ ...prev, data, error: null }));
    }, []);

    const setLoading = useCallback((isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
    }, []);

    const setError = useCallback((error: Error | null) => {
        setState(prev => ({ ...prev, error, isLoading: false }));
    }, []);

    const reset = useCallback(() => {
        setState({
            data: initialData,
            isLoading: false,
            error: null,
        });
    }, [initialData]);

    const execute = useCallback(async (asyncFn: () => Promise<T>) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await asyncFn();
            setState({ data: result, isLoading: false, error: null });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error(String(error)),
            }));
        }
    }, []);

    return {
        ...state,
        setData,
        setLoading,
        setError,
        reset,
        execute,
    };
}
