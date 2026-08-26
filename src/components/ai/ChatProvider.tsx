"use client"

import { createChat, createMessage, readMessages, readChats } from "@/client";
import type { AiChatCreate, AiChatRead, AiMessageRead } from "@/client"
import { useMutation, useQuery, useQueryClient, MutationState } from "@tanstack/react-query";
import {
	createContext,
	useContext,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";

type ChatContextType = {
	chat: AiChatRead | null
	setChat: Dispatch<SetStateAction<AiChatRead | null>>
	createChat: (data: AiChatCreate) => boolean
	chats: AiChatRead[]
	messages: AiMessageRead[]
	isLoading: boolean
	sendMessage: (content: string) => boolean
	waitingMessage: string | null
	createChatState: MutationState
	drafts: Record<string, string>
	setDrafts: Dispatch<SetStateAction<Record<string, string>>>
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
	const [chat, setChat] = useState<AiChatRead | null>(null)
	const [waitingMessage, setWaitingMessage] = useState<string | null>(null)
	const [drafts, setDrafts] = useState<Record<string, string>>({})

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
			chat,
			chats,
			setChat,
			createChat: createNewChat,
			createChatState: createChatMutation,
			messages,
			sendMessage,
			isLoading,
			waitingMessage,
			drafts,
			setDrafts,
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
