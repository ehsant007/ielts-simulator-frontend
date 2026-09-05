import { AiChatCreate, AiChatRead, AiChatUpdate, AiMessageCreate, AiMessageRead, createChat, createMessage, deleteChat, readChats, readMessages, updateChat } from "@/client"
import { InfiniteData, useInfiniteQuery, useMutation, useMutationState, useQueryClient } from "@tanstack/react-query"
import { removeItemFromInfiniteCache, updateItemInInfiniteCache } from "./tanstack_utils"

export const chatsQueryKey = ["ai-chats"] as const
export const pinnedChatsQueryKey = ["pinned-ai-chats"] as const
export const messagesQueryKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const
export const messageCreateKey = ["ai-message-create"] as const
export const chatCreateKey = ["ai-chat-create"] as const
export const chatRemoveKey = ["ai-chat-remove"] as const
export const chatUpdateKey = ["ai-chat-update"]


export function useMessagesQuery(chat_id: string | null | undefined) {

	const messagesQuery = useInfiniteQuery({
		enabled: !!chat_id,
		queryKey: messagesQueryKey(chat_id ?? "no-active-chat"),

		queryFn: async ({ pageParam, signal }) => readMessages({
			path: { chat_id: chat_id! },
			query: {
				limit: 3,
				...pageParam,
			},
			signal,
		}).then(res => res.data),

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


	const messages = messagesQuery.data?.pages.flatMap((page) => page) ?? []

	const pendingMessages = useMutationState({
		filters: {
			mutationKey: messageCreateKey,
			status: "pending",
		},
		select: mutation => mutation.state.variables as AiMessageCreate,
	})

	pendingMessages.forEach(({ id, chat_id, content }) => {
		if (!id)
			return
		messages.push({
			id,
			chat_id,
			content,
			role: "user",
			created_at: new Date().toISOString(),
		})
	})


	return {
		messagesQuery,
		messages,
	}
}


export function useMessageCreateMutation({ onMutate, onError }: { onMutate?: () => void, onError?: (message: string) => void }) {
	const queryClient = useQueryClient()

	const createMessageMutation = useMutation({
		mutationKey: messageCreateKey,

		mutationFn: (data: AiMessageCreate) => {
			return createMessage({
				body: data,
			})
		},

		onMutate: () => {
			onMutate?.()
		},

		onError: ({ message }) => {
			onError?.(message)
		},

		onSuccess: ({ data: { request, response } }, { chat_id }) => {
			queryClient.setQueryData<InfiniteData<AiMessageRead[]>>(
				messagesQueryKey(chat_id),
				(prev) => {
					if (!prev || prev.pages.length === 0) {
						return prev
					}

					const pages = prev.pages

					return {
						...prev,
						pages: [
							...pages.slice(0, -1),
							[...pages[pages.length - 1], request, response],
						],
					}
				}
			)
		},

		// onSettled: (_data, _error, variables) => {
		// 	return queryClient.invalidateQueries({
		// 		queryKey: messagesQueryKey(variables.chat_id),
		// 	})
		// },
	})

	return createMessageMutation
}


export function useChatsQuery() {
	const chatsQuery = useInfiniteQuery({
		queryKey: chatsQueryKey,

		queryFn: ({ pageParam }) => readChats({
			query: {
				...pageParam,
			}
		}).then((res) => res.data),

		initialPageParam: { pinned: true, limit: 20 },

		getPreviousPageParam: undefined,

		getNextPageParam: (lastPage, allPages) => {
			const limit = 50

			if (allPages.length === 1) {
				return { pinned: false, limit }
			}

			return (lastPage.length > 0
				? { before: lastPage[lastPage.length - 1].last_active, pinned: false, limit }
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

	const chats = (chatsQuery.data?.pages.flatMap(page => page) ?? [])
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

	const pinnedChats = chats.filter(chat => chat.pinned).sort((a, b) => b.last_active.localeCompare(a.last_active))
	const recentChats = chats.filter(chat => !chat.pinned).sort((a, b) => b.last_active.localeCompare(a.last_active))

	return {
		chatsQuery,
		pinnedChats,
		recentChats,
	}
}

export function useChatCreateMutation({ onSuccess }: { onSuccess?: (chat: AiChatRead) => void }) {
	const queryClient = useQueryClient()

	const chatCreateMutation = useMutation({
		mutationKey: chatCreateKey,

		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }) => {
			queryClient.setQueryData<InfiniteData<AiChatRead[]>>(chatsQueryKey,
				(prev) => {
					if (!prev || prev.pages.length < 1) {
						return prev
					}

					const pages = prev.pages

					return {
						...prev,
						pages: [pages[0], [newChat, ...pages[1]], ...pages.slice(2)]
					}
				}
			)

			onSuccess?.(newChat)
		}
	})

	return chatCreateMutation
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

