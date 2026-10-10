'use client'

import { toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

type APIError = { status: number, detail: string }

type ErrorObject = Record<string, unknown>

const isObject = (value: unknown): value is ErrorObject =>
	typeof value === "object" && value !== null

const getErrorMessage = (value: unknown): string | undefined => {
	if (typeof value === "string")
		return value

	if (Array.isArray(value)) {
		const messages = value.flatMap(item =>
			isObject(item) && typeof item.msg === "string"
				? [item.msg]
				: [],
		)

		return messages.length ? messages.join("\n") : undefined
	}

	if (isObject(value) && typeof value.msg === "string")
		return value.msg

	return undefined
}

// Error handler for API errors
const handleApiError = (error: unknown) => {
	let message = "Something went wrong!"

	if (typeof error === "string")
		message = error
	else if (isObject(error)) {
		message =
			getErrorMessage(error.detail) ??
			(typeof error.message === "string" ? error.message : undefined) ??
			getErrorMessage(error) ??
			message
	}

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

				retry: (failureCount, error: unknown) => {
					const status = (error as APIError).status
					if (status && status >= 400 && status < 500) {
						return false
					}

					return failureCount < 3
				}
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