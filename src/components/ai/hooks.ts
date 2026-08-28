import { AiChatCreate, AiChatRead, AiChatUpdate, AiMessageRead, createChat, createMessage, deleteChat, readChats, readMessages, updateChat } from "@/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useChatStore, useChatStoreApi } from "./ChatStoreProvider"
import { SetStateAction } from "react"
import { v7 as uuid7 } from "uuid"


const getMessagesQueyKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const

export function useMessageCreateMutation() {
	const queryClient = useQueryClient()
	const chatStore = useChatStoreApi()

	const setMessages = (chat_id: string, set: SetStateAction<AiMessageRead[]>) => {
		queryClient.setQueryData<AiMessageRead[]>(
			getMessagesQueyKey(chat_id),
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const create = useMutation({
		mutationFn: (data: { chat_id: string, message: string }) => {
			return createMessage({
				body: { content: data.message },
				path: { chat_id: data.chat_id },
			})
		},

		onMutate: (data) => {
			// Add user message optimistically
			const optimisticMessage: AiMessageRead = {
				id: uuid7(),
				content: data.message,
				created_at: new Date().toISOString(),
				chat_id: data.chat_id,
				role: "user",
			}
			setMessages(optimisticMessage.chat_id, prev => [...prev, optimisticMessage])

			return { optimisticMessage }
		},

		onSuccess: ({ data: { request, response } }, _content, context) => {
			setMessages(request.chat_id, (prev) => {
				const index = prev.findIndex((msg) => msg.id === context.optimisticMessage.id)

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

			setMessages(context.optimisticMessage.chat_id, prev =>
				prev.filter(msg => msg.id !== context.optimisticMessage.id)
			)

			const s = chatStore.getState()
			s.setDraft(s.activeChat?.id ?? "default", context.optimisticMessage.content)
		},

	})

	return { create }
}


export function useChats() {
	const queryClient = useQueryClient()
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const { create: { mutate: createMessage } } = useMessageCreateMutation()

	const chatsKey = ["ai-chats"] as const

	const setChats = (set: SetStateAction<AiChatRead[]>) => {
		queryClient.setQueryData<AiChatRead[]>(
			chatsKey,
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const read = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: chatsKey,
	})

	const create = useMutation({
		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }, { message }) => {
			setActiveChat(newChat)
			setChats(prev => [newChat, ...prev])
			createMessage({ chat_id: newChat.id, message })
		}
	})

	const del = useMutation({
		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			setChats(prev => prev.filter((chat) => chat.id !== chat_id))
		},
	})

	const update = useMutation({
		mutationFn: ({ chat_id, data }: { chat_id: string, data: AiChatUpdate }) => updateChat({
			body: data,
			path: { chat_id },
		}),

		onMutate: async ({ chat_id, data }) => {
			await queryClient.cancelQueries({ queryKey: chatsKey })
			const previous = queryClient.getQueryData<AiChatRead[]>(chatsKey) ?? []

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
		create,
		read,
		update,
		del,
	}
}


export function useMessages() {
	const activeChat = useChatStore((s) => s.activeChat)

	const { create } = useMessageCreateMutation()

	const read = useQuery({
		enabled: !!activeChat,
		queryFn: ({ signal }) =>
			readMessages({
				path: { chat_id: activeChat!.id },
				signal,
			}).then((res) => res.data),
		queryKey: getMessagesQueyKey(activeChat?.id ?? "no-active-chat"),
	})

	return {
		create,
		read,
	}
}
