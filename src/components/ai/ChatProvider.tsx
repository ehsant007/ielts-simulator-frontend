"use client"

import { readChatMessages, type AiChatRead, type AiMessageRead } from "@/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
	messages: AiMessageRead[]
	addMessage: (msg: AiMessageRead) => void
	isLoading: boolean
	waitingMessage: string | null | undefined
	setWaitingMessage: Dispatch<SetStateAction<string | null | undefined>>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

type ChatProviderProps = {
	children: ReactNode,
}

export function ChatProvider({ children }: ChatProviderProps) {
	const [chat, setChat] = useState<AiChatRead | undefined>(undefined)
	const [waitingMessage, setWaitingMessage] = useState<string | null | undefined>()

	const { data: messages = [], isLoading } = useQuery({
		enabled: !!chat,
		queryFn: () => readChatMessages({ path: { chat_id: chat!.id } }).then((res) => res.data),
		queryKey: ["chat", chat?.id, "messages"],
	})

	const queryClient = useQueryClient()

	const addMessage = (msg: AiMessageRead) => {
		if (!chat)
			return

		queryClient.setQueryData<AiMessageRead[]>(
			["chat", chat.id, "messages"],
			(old = []) => [...old, msg],
		)
	}


	return <ChatContext.Provider
		value={{
			chat,
			setChat,
			messages,
			addMessage,
			isLoading,
			waitingMessage,
			setWaitingMessage
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
