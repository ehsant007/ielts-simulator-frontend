import { AiChatCreate, AiChatRead, AiChatUpdate, createChat, deleteChat, readChats, readMessages, updateChat } from "@/client"
import { InfiniteData, QueryClient, useInfiniteQuery, useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query"
import { SetStateAction } from "react"
import { v7 as uuid7 } from "uuid"

export const chatsQueryKey = ["ai-chats"] as const
export const pinnedChatsQueryKey = ["pinned-ai-chats"] as const
export const messagesQueryKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const
export const messageCreateKey = ["ai-message-create"] as const
export const chatCreateKey = ["ai-chat-create"] as const
export const chatRemoveKey = ["ai-chat-remove"] as const
export const chatUpdateKey = ["ai-chat-update"]


type UseCollectionProps<T> = {
	onCreateSuccess?: (data: T) => void,
	onCreate?: () => void
	onError?: (data: T) => void
}


export function useChats({ onCreateSuccess }: UseCollectionProps<AiChatRead> = {}) {
	const queryClient = useQueryClient()

	const setChats = (set: SetStateAction<AiChatRead[]>) => {
		queryClient.setQueryData<AiChatRead[]>(
			chatsQueryKey,
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const query = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: chatsQueryKey,
	})

	const create = useMutation({
		mutationKey: chatCreateKey,

		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }) => {
			setChats(prev => [newChat, ...prev])
			onCreateSuccess?.(newChat)
		}
	})

	const remove = useMutation({
		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			setChats(prev => prev.filter((chat) => chat.id !== chat_id))
		},
	})

	// const update = useMutation({
	// 	mutationFn: ({ chat_id, data }: { chat_id: string, data: AiChatUpdate }) => updateChat({
	// 		body: data,
	// 		path: { chat_id },
	// 	}),

	// 	onMutate: async ({ chat_id, data }) => {
	// 		await queryClient.cancelQueries({ queryKey: chatsQueryKey })
	// 		const previous = queryClient.getQueryData<AiChatRead[]>(chatsQueryKey) ?? []

	// 		// Add changes optimistically
	// 		setChats(prev => {
	// 			const i = prev.findIndex((chat) => chat.id === chat_id)
	// 			if (i === -1)
	// 				return prev
	// 			return [
	// 				...prev.slice(0, i),
	// 				{ ...prev[i], ...data },
	// 				...prev.slice(i + 1)
	// 			]
	// 		}
	// 		)

	// 		return { previous }
	// 	},

	// 	onSuccess: ({ data }, { chat_id }) => {
	// 		setChats(prev => {
	// 			const i = prev.findIndex((chat) => chat.id === chat_id)
	// 			if (i === -1)
	// 				return prev
	// 			return [
	// 				...prev.slice(0, i),
	// 				data,
	// 				...prev.slice(i + 1)
	// 			]
	// 		}
	// 		)
	// 	},

	// 	onError: (_error, _variables, context) => {
	// 		if (context)
	// 			setChats(context.previous)
	// 	},
	// })


	return {
		query,
		create,
		//update,
		remove,
	}
}


export function useMessages(chat_id: string | null | undefined) {

	const query = useInfiniteQuery({
		enabled: !!chat_id,
		queryKey: messagesQueryKey(chat_id ?? "no-active-chat"),

		queryFn: async ({ pageParam, signal }) => {
			console.log("QUERY", {
				chat_id,
				pageParam,
			})

			const res = await readMessages({
				path: { chat_id: chat_id! },
				query: {
					limit: 3,
					...pageParam,
				},
				signal,
			})

			console.log("RESULT", res.data)

			return res.data ?? []
		},

		initialPageParam: {},

		getPreviousPageParam: (firstPage) =>
			firstPage.length > 0
				? { before: firstPage[0].id }
				: undefined,

		getNextPageParam: (lastPage) =>
			lastPage.length > 0
				? { after: lastPage[lastPage.length - 1].id }
				: undefined,
	})

	return {
		query,
	}
}


export function findIndex2D<T>(
	array: T[][],
	predicate: (item: T) => boolean,
): [number, number] {
	for (let i = 0; i < array.length; i++) {
		for (let j = 0; j < array[i].length; j++) {
			if (predicate(array[i][j])) {
				return [i, j]
			}
		}
	}

	return [-1, -1]
}

export function updateItemInInfiniteCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
	update: ((prevItem: T) => T) | Partial<T>
) {
	qc.setQueryData<InfiniteData<T[]>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}

			const pages = prev.pages

			const [p, c] = findIndex2D(pages, (item) => item.id === itemId)
			if (c === -1)
				return prev

			const updatedItem =
				typeof update === "function"
					? update(pages[p][c])
					: { ...pages[p][c], ...update }

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					[
						...pages[p].slice(0, c),
						updatedItem,
						...pages[p].slice(c + 1),
					],
					...pages.slice(p + 1),
				]
			}
		}
	)
}


export function removeItemFromInfiniteCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
) {
	qc.setQueryData<InfiniteData<T[]>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}
			const pages = prev.pages

			const [p, c] = findIndex2D(pages, (item) => item.id === itemId)
			if (c === -1)
				return prev

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					[
						...pages[p].slice(0, c),
						...pages[p].slice(c + 1),
					],
					...pages.slice(p + 1),
				]
			}
		}
	)
}


export function updateItemInCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
	update: ((prevItem: T) => T) | Partial<T>
) {
	qc.setQueryData<T[]>(queryKey,
		(prev) => {
			if (!prev) {
				return prev
			}

			const i = prev.findIndex((item) => item.id === itemId)
			if (i === -1)
				return prev

			const updatedItem =
				typeof update === "function"
					? update(prev[i])
					: { ...prev[i], ...update }

			return [
				...prev.slice(0, i),
				updatedItem,
				...prev.slice(i + 1)
			]
		}
	)
}


export function removeItemFromCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
) {
	qc.setQueryData<T[]>(queryKey,
		(prev) => {
			if (!prev) {
				return prev
			}

			const i = prev.findIndex((item) => item.id === itemId)
			if (i === -1)
				return prev

			return [
				...prev.slice(0, i),
				...prev.slice(i + 1)
			]
		}
	)
}

export function useChats2() {
	const query = useInfiniteQuery({
		queryKey: chatsQueryKey,

		queryFn: ({ pageParam }) => readChats({
			query: {
				...pageParam,
				limit: 100,
			}
		}).then((res) => res.data),

		initialPageParam: { pinned: true },

		getPreviousPageParam: undefined,

		getNextPageParam: (lastPage, allPages) => {
			if (allPages.length === 1) {
				return { pinned: false }
			}

			return (lastPage.length > 0
				? { before: lastPage[lastPage.length - 1].last_active, pinned: false }
				: undefined)
		}
	})

	const pendingCreates = useMutationState({
		filters: {
			mutationKey: chatCreateKey,
			status: "pending",
		},
		select: mutation => mutation.state.variables as AiChatCreate
	})

	const pendingRemoves = useMutationState({
		filters: {
			mutationKey: chatRemoveKey,
			status: "pending",
		},
		select: mutation => mutation.state.variables as string
	})

	const pendingUpdate = useMutationState({
		filters: {
			mutationKey: chatUpdateKey,
			status: "pending",
		},
		select: mutation => mutation.state.variables as AiChatUpdate
	})

	const pendingUpdateMap = new Map(pendingUpdate.map(update => [update.id, update]))

	const chats = (query.data?.pages.flatMap(page => page) ?? [])
		.filter(chat => !pendingRemoves.includes(chat.id))
		.map(chat => {
			const update = pendingUpdateMap.get(chat.id)
			if (!update)
				return chat
			return { ...chat, ...update }
		})

	pendingCreates.forEach((create) => {
		if (!create.id)
			return

		chats.push({
			id: create.id,
			user_id: "user",
			app_id: null,
			title: "Creating new chat ...",
			created_at: new Date().toISOString(),
			last_active: new Date().toISOString(),
			pinned: false,
		})
	})

	console.log(chats)

	const pinnedChats = chats.filter(chat => chat.pinned).sort((a, b) => b.last_active.localeCompare(a.last_active))
	const recentChats = chats.filter(chat => !chat.pinned).sort((a, b) => b.last_active.localeCompare(a.last_active))

	console.log(pinnedChats)
	console.log(recentChats)

	return {
		query,
		pinnedChats,
		recentChats,
	}
}


export function useChatUpdateMutation() {
	const queryClient = useQueryClient()

	const update = useMutation({
		mutationKey: chatUpdateKey,

		mutationFn: (data: AiChatUpdate) => updateChat({
			body: data
		}),

		onSuccess: ({ data: chat }) => {
			updateItemInInfiniteCache(queryClient, chatsQueryKey, chat.id, chat)
		},

	})

	return { update }
}


export function useChatRemoveMutation() {
	const queryClient = useQueryClient()

	const remove = useMutation({
		mutationKey: chatRemoveKey,

		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			removeItemFromInfiniteCache(queryClient, chatsQueryKey, chat_id)
		},
	})

	return { remove }
}

