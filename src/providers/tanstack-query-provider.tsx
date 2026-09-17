'use client'

import { toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'


// Error handler for API errors
const handleApiError = (error: Error) => {
	let message = "Something went wrong!"
	
	if(typeof error === "string")
		message = error
	else if(error.message)
		message = error.message

	toaster.create({
		title: "Error",
		type: "error",
		closable: true,
		duration: 3000,
		description: message,
	})
}

export default function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
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