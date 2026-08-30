import { AiChatCreate, AiChatRead, AiChatUpdate, AiMessageRead, createChat, createMessage, deleteChat, readChats, readMessages, updateChat } from "@/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useChatStore, useChatStoreApi } from "./ChatProvider"
import { SetStateAction } from "react"
import { v7 as uuid7 } from "uuid"


export const chatsQueryKey = ["ai-chats"] as const
export const messagesQueryKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const
export const messageCreateKey = ["ai-message-create"] as const

export function useMessageCreateMutation() {
	const queryClient = useQueryClient()
	const chatStore = useChatStoreApi()

	const setMessages = (chat_id: string, set: SetStateAction<AiMessageRead[]>) => {
		queryClient.setQueryData<AiMessageRead[]>(
			messagesQueryKey(chat_id),
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const createMutation = useMutation({
		mutationKey: messageCreateKey,

		mutationFn: (data: { chat_id: string, message: string }) => {
			return createMessage({
				body: { content: data.message },
				path: { chat_id: data.chat_id },
			})
		},

		onMutate: (data) => {
			// Add user message optimistically
			const optimisticMsg: AiMessageRead = {
				id: uuid7(),
				content: data.message,
				created_at: new Date().toISOString(),
				chat_id: data.chat_id,
				role: "user",
			}
			setMessages(optimisticMsg.chat_id, prev => [...prev, optimisticMsg])

			return { optimisticMsg }
		},

		onSuccess: ({ data: { request, response } }, _content, context) => {
			setMessages(request.chat_id, (prev) => {
				const index = prev.findIndex((msg) => msg.id === context.optimisticMsg.id)

				if (index === -1)
					return [...prev, request, response]

				return [
					...prev.slice(0, index),
					request,
					response,
					...prev.slice(index + 1),
				]
			})
		},

		onError: (_error, _data, context) => {
			if (!context)
				return

			const { optimisticMsg } = context
			setMessages(optimisticMsg.chat_id, prev => prev.filter(msg => msg.id !== optimisticMsg.id))
			chatStore.getState().setDraft(optimisticMsg.chat_id, optimisticMsg.content)
		},

	})

	return { createMutation }
}


export function useChats() {
	const queryClient = useQueryClient()
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const { createMutation: { mutate: createMessage } } = useMessageCreateMutation()

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

	const createMutation = useMutation({
		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }, { message }) => {
			setActiveChat(newChat)
			setChats(prev => [newChat, ...prev])
			createMessage({ chat_id: newChat.id, message })
		}
	})

	const deleteMutation = useMutation({
		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			setChats(prev => prev.filter((chat) => chat.id !== chat_id))
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ chat_id, data }: { chat_id: string, data: AiChatUpdate }) => updateChat({
			body: data,
			path: { chat_id },
		}),

		onMutate: async ({ chat_id, data }) => {
			await queryClient.cancelQueries({ queryKey: chatsQueryKey })
			const previous = queryClient.getQueryData<AiChatRead[]>(chatsQueryKey) ?? []

			// Add changes optimistically
			setChats(prev => {
				const i = prev.findIndex((chat) => chat.id === chat_id)
				if (i === -1)
					return prev
				return [
					...prev.slice(0, i),
					{ ...prev[i], ...data },
					...prev.slice(i + 1)
				]
			}
			)

			return { previous }
		},

		onSuccess: ({ data }, { chat_id }) => {
			setChats(prev => {
				const i = prev.findIndex((chat) => chat.id === chat_id)
				if (i === -1)
					return prev
				return [
					...prev.slice(0, i),
					data,
					...prev.slice(i + 1)
				]
			}
			)
		},

		onError: (_error, _variables, context) => {
			if (context)
				setChats(context.previous)
		},
	})


	return {
		query,
		createMutation,
		updateMutation,
		deleteMutation,
	}
}


export function useMessages(chat_id: string | null) {

	const { createMutation } = useMessageCreateMutation()

	const query = useQuery({
		enabled: !!chat_id,
		queryFn: ({ signal }) =>
			readMessages({
				path: { chat_id: chat_id! },
				signal,
			}).then((res) => res.data),
		queryKey: messagesQueryKey(chat_id ?? "no-active-chat"),
	})

	return {
		query,
		createMutation,
	}
}
