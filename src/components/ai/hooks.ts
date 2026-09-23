import { AiChatCreate, AiMessagePage, AiChatRead, AiChatPage, AiChatUpdate, AiMessageCreate, AiMessageRead, createChat, createMessage, deleteChat, readChatById, readChats, readMessages, updateChat } from "@/client"
import { InfiniteData, infiniteQueryOptions, useInfiniteQuery, useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query"
import { streamMessage } from "./stream"
import { useCallback, useEffect, useRef, useState } from "react"
//import { usePathname, useRouter } from "next/navigation"
import { useChatStore } from "./ChatProvider"

export const chatsQueryKey = ["ai-chats"] as const
export const chatCreateKey = ["ai-chat-create"] as const
export const chatRemoveKey = ["ai-chat-remove"] as const
export const chatUpdateKey = ["ai-chat-update"]

export const messagesQueryKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const
export const messageCreateKey = ["ai-message-create"] as const

// ------------- Chats -------------------------

export function useChatQuery(chatId: string | null | undefined) {
	const queryClient = useQueryClient()

	return useQuery({
		enabled: !!chatId,
		queryKey: ["ai-chats", chatId],

		queryFn: () =>
			readChatById({
				path: { chat_id: chatId! },
			}).then(res => res.data),

		initialData: () => {
			const data = queryClient.getQueryData<InfiniteData<AiChatPage>>(chatsQueryKey)

			return data?.pages
				.flatMap(page => page.chats)
				.find(chat => chat.id === chatId)
		},

		initialDataUpdatedAt: () =>
			queryClient.getQueryState(chatsQueryKey)?.dataUpdatedAt,

		staleTime: Infinity,
	})
}

export function useChatsQuery() {
	const chatsQuery = useInfiniteQuery({
		staleTime: Infinity,
		queryKey: chatsQueryKey,

		queryFn: ({ pageParam }) => readChats({
			query: {
				...pageParam,
			}
		}).then((res) => res.data),

		initialPageParam: { pinned: true, limit: 20 },

		getNextPageParam: () => undefined,

		getPreviousPageParam: (page, allPages) => {
			const limit = 20

			if (allPages.length === 1) {
				return { pinned: false, limit }
			}

			return (page.previous_cursor
				? { before: page.previous_cursor, pinned: false, limit }
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

	const chats = (chatsQuery.data?.pages.flatMap(page => page.chats) ?? [])
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

export function useChatCreateMutation({ onSuccess }: { onSuccess?: (chat: AiChatRead, createData: AiChatCreate) => void }) {
	const queryClient = useQueryClient()

	const chatCreateMutation = useMutation({
		mutationKey: chatCreateKey,

		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }, createData) => {
			queryClient.setQueryData<InfiniteData<AiChatPage>>(chatsQueryKey,
				(prev) => {
					if (!prev || prev.pages.length < 1) {
						return prev
					}

					const pages = prev.pages

					return {
						...prev,
						pages: [
							pages[0],
							{ ...pages[1], chats: [newChat, ...pages[1].chats] },
							...pages.slice(2),
						]
					}
				}
			)

			onSuccess?.(newChat, createData)
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
			queryClient.setQueryData<InfiniteData<AiChatPage>>(chatsQueryKey,
				prev => {
					if (!prev)
						return

					return {
						...prev,
						pages: prev.pages.map((page) => {
							const i = page.chats.findIndex(c => c.id === chat.id)
							if (i === -1)
								return page
							return {
								...page,
								chats: [
									...page.chats.slice(0, i),
									chat,
									...page.chats.slice(i + 1)
								]
							}
						})

					}
				}
			)
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
			queryClient.setQueryData<InfiniteData<AiChatPage>>(chatsQueryKey,
				prev => {
					if (!prev)
						return

					return {
						...prev,
						pages: prev.pages.map((page) => {
							const i = page.chats.findIndex(c => c.id === chat_id)
							if (i === -1)
								return page
							return {
								...page,
								chats: [
									...page.chats.slice(0, i),
									...page.chats.slice(i + 1)
								]
							}
						})

					}
				}
			)
		},
	})

	return { remove }
}


// ------------- Messages -------------------------

export function messagesQueryOptions(chat_id: string | null | undefined) {
	return infiniteQueryOptions({
		staleTime: Infinity,
		enabled: !!chat_id,
		queryKey: messagesQueryKey(chat_id ?? "no-active-chat"),

		queryFn: async ({ pageParam, signal }) => readMessages({
			path: { chat_id: chat_id! },
			query: {
				limit: 5,
				...pageParam,
			},
			signal,
		}).then(res => res.data),

		initialPageParam: {},

		getPreviousPageParam: (page) =>
			page.previous_cursor
				? { before: page.previous_cursor }
				: undefined,

		getNextPageParam: (page) =>
			page.next_cursor
				? { after: page.next_cursor }
				: undefined,
	})
}

export function useMessagesQuery(chat_id: string | null | undefined) {
	const messagesQuery = useInfiniteQuery(messagesQueryOptions(chat_id))

	const messages = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? []

	const pendingMessages = useMutationState({
		filters: {
			mutationKey: messageCreateKey,
			status: "pending",
		},
		select: mutation => mutation.state.variables as AiMessageCreate,
	})

	pendingMessages
		.filter(message => message.chat_id === chat_id)
		.forEach(({ id, chat_id, content }) => {
			if (!id || messages.some((msg) => msg.id === id))
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
		...messagesQuery,
		messages,
	}
}

export type UseMessageCreateMutationProps = {
	onMutate?: (createData: AiMessageCreate) => void
	onError?: (createData: AiMessageCreate) => void
	onSettled?: (createData: AiMessageCreate) => void
}

export function useMessageCreateMutation({ onMutate, onError, onSettled }: UseMessageCreateMutationProps) {
	const queryClient = useQueryClient()

	const createMessageMutation = useMutation({
		mutationKey: messageCreateKey,

		mutationFn: (data: AiMessageCreate) => {
			return createMessage({
				body: data,
			})
		},

		onMutate: (createData) => {
			onMutate?.(createData)
		},

		onError: (_error, createData) => {
			onError?.(createData)
		},

		onSuccess: ({ data: { request, response } }, { chat_id }) => {
			queryClient.setQueryData<InfiniteData<AiMessagePage>>(
				messagesQueryKey(chat_id),
				(prev) => {
					if (!prev || prev.pages.length === 0) {
						return prev
					}

					const pages = prev.pages
					const lastPage = pages[pages.length - 1]

					return {
						...prev,
						pages: [
							...pages.slice(0, -1),
							{ ...lastPage, messages: [...lastPage.messages, request, response] },
						],
					}
				}
			)
		},

		onSettled: (_data, _error, createData) => {
			onSettled?.(createData)
		}
	})

	return createMessageMutation
}


const streamControllers = new Map<string, AbortController>()
export function cancelMessageCreate(chatId: string | undefined) {
	if (!chatId)
		return
	streamControllers.get(chatId)?.abort()
}

export type UseMessageCreateStreamMutationProps = {
	onStream?: (data: string, chat_id: string) => void
} & UseMessageCreateMutationProps

export function useMessageCreateStreamMutation({ onMutate, onError, onSettled, onStream }: UseMessageCreateStreamMutationProps) {
	const queryClient = useQueryClient()

	const addMessages = (chat_id: string, values: AiMessageRead[]) => queryClient.setQueryData<InfiniteData<AiMessagePage>>(
		messagesQueryKey(chat_id),
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}

			const pages = prev.pages
			const lastPage = pages[pages.length - 1]

			return {
				...prev,
				pages: [
					...pages.slice(0, -1),
					{ ...lastPage, messages: [...lastPage.messages, ...values] },
				],
			}
		}
	)

	let pending = ""
	let raf: number | null = null

	function pushDelta(delta: string, chat_id: string) {
		pending += delta

		if (raf !== null)
			return

		raf = requestAnimationFrame(() => {
			const value = pending
			pending = ""
			raf = null
			onStream?.(value, chat_id)
		})
	}

	const createMessageMutation = useMutation({
		mutationKey: messageCreateKey,

		mutationFn: async (data: AiMessageCreate) => {
			const controller = new AbortController()
			streamControllers.set(data.chat_id, controller)

			let response: AiMessageRead | null = null

			try {
				for await (const event of streamMessage(
					data,
					controller.signal,
				)) {

					switch (event.type) {

						case "start":
							addMessages(data.chat_id, [event.request])
							response = event.response
							break

						case "delta":
							pushDelta(event.delta, data.chat_id)
							response!.content += event.delta
							break

						case "done":
							break

						case "error":
							throw new Error(event.message)
					}
				}
			} finally {
				if (streamControllers.get(data.chat_id) === controller)
					streamControllers.delete(data.chat_id)
			}

			if (response == null)
				throw new Error("No response from server!")

			addMessages(data.chat_id, [response])
		},

		onMutate: (data) => {
			onMutate?.(data)
		},

		onError: (_error, data) => {
			onError?.(data)
		},

		onSettled: (_data, _error, data) => {
			onSettled?.(data)
		}
	})

	return createMessageMutation
}


type RecorderState = "stopping" | "stopped" | "starting" | "recording" | "error"

export function useRecorder() {
	const recorderRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<Blob[]>([])
	const state = useRef<RecorderState>("stopped")
	const [isRecording, setIsRecording] = useState(false)
	const recording = useRef<Blob | null>(null)

	const cleanup = useCallback(() => {
		const recorder = recorderRef.current

		if (recorder && recorder.state !== "inactive") {
			recorder.ondataavailable = null
			recorder.onstop = null
			recorder.stop()
		}

		recorder?.stream.getTracks().forEach(track => track.stop())

		recorderRef.current = null
		chunksRef.current = []
		state.current = "stopped"
	}, [])

	useEffect(() => {
		state.current = "stopped"
		return cleanup
	}, [cleanup])

	const start = useCallback(async () => {
		if (state.current === "starting" || state.current === "stopping")
			return

		let stream: MediaStream | null = null

		try {
			cleanup()
			state.current = "starting"

			stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			})

			const recorder = new MediaRecorder(stream)
			recorderRef.current = recorder

			if (state.current !== "starting") {
				cleanup()
				return
			}

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0)
					chunksRef.current.push(event.data)
			}

			recorder.start()
			state.current = "recording"
			setIsRecording(true)
		} catch (err) {
			stream?.getTracks().forEach(track => track.stop())
			recorderRef.current = null
			state.current = "error"
			console.error("Failed to start recording:", err)
		}
	}, [cleanup])

	const stop = useCallback(() => {
		const currentState = state.current
		if (currentState !== "starting" && currentState !== "recording")
			return Promise.resolve(null)

		state.current = "stopping"
		const recorder = recorderRef.current
		if (!recorder)
			return Promise.resolve(null)

		return new Promise<Blob>((resolve) => {
			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, {
					type: recorder.mimeType,
				})

				cleanup()
				setIsRecording(false)
				recording.current = blob
				resolve(blob)
			}

			recorder.stop()
		})
	}, [cleanup])

	const getRecording = useCallback(() => recording.current, [])
	const getRecorder = useCallback(() => recorderRef.current, [])

	return {
		isRecording,
		state,
		start,
		stop,
		getRecording,
		getRecorder,
	}
}


// export function useSelectChat() {
// 	const pathname = usePathname()
// 	const { push } = useRouter()
// 	const setActiveChat = useChatStore(s => s.setActiveChat)

// 	const selectChat = useCallback((chat: AiChatRead | null | undefined) => {

// 		if (pathname.startsWith("/chat")) {
// 			if (chat) {
// 				push(`/chat/${chat.id}`)
// 			} else {
// 				push("/chat")
// 			}
// 		} 

// 		setActiveChat(chat)

// 	}, [pathname, push, setActiveChat])

// 	return selectChat
// }


export function useSelectChat() {
	const setActiveChatId = useChatStore(s => s.setActiveChatId)

	return (chat: AiChatRead | null | undefined) => {
		if (window.location.pathname.startsWith("/chat")) {
			window.history.pushState(
				null,
				"",
				chat ? `/chat/${chat.id}` : "/chat",
			)

		}

		setActiveChatId(chat?.id)
	}
}


export function useActiveChat() {
	const chatId = useChatStore(s => s.activeChatId)
	const {data: chat} = useChatQuery(chatId)

	return chat
}