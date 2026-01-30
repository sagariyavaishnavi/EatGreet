import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 1, // Data is fresh for 1 minute
            cacheTime: 1000 * 60 * 5, // Cache persists for 5 minutes
            refetchOnWindowFocus: false, // Prevent excessive refetching
            retry: 1, // Retry failed requests once
        },
    },
});
