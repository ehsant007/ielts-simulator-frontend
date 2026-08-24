"use client"

import type { AiChatRead } from "@/client";
import {
	createContext,
	useContext,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";

type ChatContextType = {
	chat: AiChatRead | undefined,
	setChat: Dispatch<SetStateAction<AiChatRead | undefined>>,
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

type ChatProviderProps = {
	children: ReactNode,
}

export function ChatProvider({ children }: ChatProviderProps) {
	const [chat, setChat] = useState<AiChatRead | undefined>(undefined)

	return <ChatContext.Provider value={{ chat, setChat }} >
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
