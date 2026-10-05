"use client"

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useChatsQuery } from "./hooks";
import { AiChatRead, AiChatPage } from "@/client";

type ChatInputContextType = {
	chatsQuery: UseInfiniteQueryResult<InfiniteData<AiChatPage, unknown>, Error>
	pinnedChats: AiChatRead[]
	recentChats: AiChatRead[]
}

const ChatInputContext = createContext<ChatInputContextType | undefined>(undefined)

type ChatInputProviderProps = {
	children: React.ReactNode
}

export function ChatInputProvider({ children }: ChatInputProviderProps) {

	const { chatsQuery, pinnedChats, recentChats } = useChatsQuery()

	return (
		<ChatInputContext.Provider value={{ chatsQuery, pinnedChats, recentChats }} >
			{children}
		</ChatInputContext.Provider>
	)
}

export function useChatInput() {
	const context = useContext(ChatInputContext)
	if (!context)
		throw new Error("useChatInput must be used within ChatInputProvider")
	return context
}
