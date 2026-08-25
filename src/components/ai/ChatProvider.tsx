"use client"

import { createMessage, readChatMessages, readChats, type AiChatRead, type AiMessageRead } from "@/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	useContext,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";

type ChatContextType = {
	chat: AiChatRead | undefined
	setChat: Dispatch<SetStateAction<AiChatRead | undefined>>
	chats: AiChatRead[]
	messages: AiMessageRead[]
	isLoading: boolean
	sendMessage: (content: string) => boolean
	waitingMessage: string | null | undefined
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

type ChatProviderProps = {
	children: ReactNode,
}

const waitingMessages = [
	"Thinking ...",
	"Working on it please wait ...",
]


export function ChatProvider({ children }: ChatProviderProps) {
	const [chat, setChat] = useState<AiChatRead | undefined>(undefined)
	const [waitingMessage, setWaitingMessage] = useState<string | null | undefined>()

	const { data: chats = [] } = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: ["chats"],
	})


	const { data: messages = [], isLoading } = useQuery({
		enabled: !!chat,
		queryFn: ({ signal }) =>
			readChatMessages({
				path: { chat_id: chat!.id },
				signal,
			}).then((res) => res.data),
		queryKey: ["chat", chat?.id, "messages"],
	})

	const queryClient = useQueryClient()

	const setMessages = (set: SetStateAction<AiMessageRead[]>) => {
		if (!chat) return

		queryClient.setQueryData<AiMessageRead[]>(
			["chat", chat.id, "messages"],
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const createMessageMutation = useMutation({
		mutationFn: (content: string) => {
			if (!chat) throw new Error("No chat selected")

			return createMessage({
				body: { content },
				path: { chat_id: chat.id },
			})
		},

		onMutate: (content) => {
			// Add user message optimistically
			const optimisticMessage: AiMessageRead = {
				id: (messages[messages.length - 1] ?? { id: 0 }).id + 1,
				content,
				created_at: new Date().toISOString(),
				chat_id: chat!.id,
				role: "user",
			}
			setMessages(prev => [...prev, optimisticMessage])

			setWaitingMessage(waitingMessages[0])

			let index = 0
			const interval = setInterval(() => {
				index = (index + 1) % waitingMessages.length
				setWaitingMessage(waitingMessages[index])
			}, 3000)

			return { interval, optimisticMessage }
		},

		onSuccess: ({ data: { request, response } }, _content, context) => {
			setMessages((prev) => {
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

	const sendMessage = (content: string) => {
		if (!chat || !content.trim() || createMessageMutation.isPending)
			return false
		createMessageMutation.mutate(content)
		return true
	}

	return <ChatContext.Provider
		value={{
			chat,
			chats,
			setChat,
			messages,
			sendMessage,
			isLoading,
			waitingMessage,
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
