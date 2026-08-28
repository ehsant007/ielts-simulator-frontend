"use client"

import { createChat, createMessage, readMessages, readChats, deleteChat, updateChat } from "@/client";
import type { AiChatCreate, AiChatRead, AiMessageRead, AiChatUpdate } from "@/client"
import { useMutation, useQuery, useQueryClient, MutationState } from "@tanstack/react-query";
import {
	createContext,
	useContext,
	useState,
	type ReactNode,
	type SetStateAction,
} from "react";
import { useChatStore } from "./ChatStoreProvider";

type ChatContextType = {
	createChat: (data: AiChatCreate) => boolean
	chats: AiChatRead[]
	messages: AiMessageRead[]
	isLoading: boolean
	sendMessage: (content: string) => boolean
	waitingMessage: string | null
	createChatState: MutationState
	deleteChat: (chat_id: string) => void
	updateChat: (input: { chat_id: string, data: AiChatUpdate }) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

type ChatProviderProps = {
	children: ReactNode,
}

const waitingMessages = [
	"Thinking ...",
	"Still working on it ...",
]


export function ChatProvider({ children }: ChatProviderProps) {
	const chat = useChatStore((s) => s.activeChat)
	const setChat = useChatStore((s) => s.setActiveChat)
	const [waitingMessage, setWaitingMessage] = useState<string | null>(null)

	const { data: chats = [] } = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: ["chats"],
	})

	const setChats = (set: SetStateAction<AiChatRead[]>) => {
		queryClient.setQueryData<AiChatRead[]>(
			["chats"],
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const { data: messages = [], isLoading } = useQuery({
		enabled: !!chat,
		queryFn: ({ signal }) =>
			readMessages({
				path: { chat_id: chat!.id },
				signal,
			}).then((res) => res.data),
		queryKey: ["chat", chat?.id, "messages"],
	})

	const queryClient = useQueryClient()

	const setMessages = (chatId: string, set: SetStateAction<AiMessageRead[]>) => {
		queryClient.setQueryData<AiMessageRead[]>(
			["chat", chatId, "messages"],
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const createMessageMutation = useMutation({
		mutationFn: (data: { chat_id: string, message: string }) => {
			return createMessage({
				body: { content: data.message },
				path: { chat_id: data.chat_id },
			})
		},

		onMutate: (data) => {
			// Add user message optimistically
			const optimisticMessage: AiMessageRead = {
				id: (messages[messages.length - 1] ?? { id: 0 }).id + 1,
				content: data.message,
				created_at: new Date().toISOString(),
				chat_id: data.chat_id,
				role: "user",
			}
			setMessages(optimisticMessage.chat_id, prev => [...prev, optimisticMessage])

			setWaitingMessage(waitingMessages[0])

			let index = 0
			const interval = setInterval(() => {
				index = (index + 1) % waitingMessages.length
				setWaitingMessage(waitingMessages[index])
			}, 3000)

			return { interval, optimisticMessage }
		},

		onSuccess: ({ data: { request, response } }, _content, context) => {
			setMessages(request.chat_id, (prev) => {
				const index = prev.findIndex(
					(msg) => msg.id === context.optimisticMessage.id,
				)

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

		onSettled: (_data, _error, _variables, context) => {
			clearInterval(context?.interval)
			setWaitingMessage(null)
		},
	})

	const createChatMutation = useMutation({
		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }, { message }) => {
			setChat(newChat)
			setChats(prev => [newChat, ...prev])
			createMessageMutation.mutate({ chat_id: newChat.id, message })
		}
	})


	const deleteChatMutation = useMutation({
		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			setChats(prev => prev.filter((chat) => chat.id !== chat_id))
		},
	})

	const updateChatMutation = useMutation({
		mutationFn: ({ chat_id, data }: { chat_id: string, data: AiChatUpdate }) => updateChat({
			body: data,
			path: { chat_id },
		}),

		onMutate: ({ chat_id, data }) => {
			const i = chats.findIndex((chat) => chat.id === chat_id)
			setChats(prev => [
				...prev.slice(0, i),
				{...prev[i], ...data},
				...prev.slice(i + 1)
			])
		},

		onSuccess: ({ data: updatedChat }, { chat_id }) => {
			const i = chats.findIndex((chat) => chat.id === chat_id)
			setChats(prev => {
				const new_chats = prev.slice()
				new_chats[i] = updatedChat
				return new_chats
			})
		}
	})

	const sendMessage = (message: string) => {
		if (!chat || !message.trim() || createMessageMutation.isPending)
			return false
		createMessageMutation.mutate({ chat_id: chat.id, message })
		return true
	}

	const createNewChat = (create_data: AiChatCreate) => {
		createChatMutation.mutate(create_data)
		return true
	}

	return <ChatContext.Provider
		value={{
			chats,
			createChat: createNewChat,
			createChatState: createChatMutation,
			messages,
			sendMessage,
			isLoading,
			waitingMessage,
			deleteChat: deleteChatMutation.mutate,
			updateChat: updateChatMutation.mutate,
		}}
	>
		{children}
	</ChatContext.Provider>
}


export function useChat() {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error("useChat must be used within a ChatProvider")
	}
	return context
}
