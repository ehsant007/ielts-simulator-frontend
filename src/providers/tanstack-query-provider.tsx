'use client'

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'


// Error handler for API errors
const handleApiError = (/*error: Error*/) => {
//   if (error instanceof ApiError && [401, 403].includes(error.status)) {
//     localStorage.removeItem("access_token")
//     window.location.href = "/login"
//   }
}

export default function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState( () => new QueryClient({
        queryCache: new QueryCache({
          onError: handleApiError,
        }),
        mutationCache: new MutationCache({
          onError: handleApiError,
        }),
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 1 * 60 * 1000, // 1 minute
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}