"use client"

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useEffectEvent } from "react";
import { useChatQuery, useChatsQuery } from "./hooks";
import { AiChatRead, AiChatPage } from "@/client";
import { useChatStore } from "./ChatProvider";
import { useRouter } from "next/navigation";


type SidebarContextType = {
	chatsQuery: UseInfiniteQueryResult<InfiniteData<AiChatPage, unknown>, Error>
	pinnedChats: AiChatRead[],
	recentChats: AiChatRead[],
	selectChat: (chat: AiChatRead) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode,
	chatId?: string,
}

export function SidebarProvider({ children, chatId }: SidebarProps) {

	const { chatsQuery, pinnedChats, recentChats } = useChatsQuery()
	const isChatIdInAddressBar = chatId != null
	const { data: chat } = useChatQuery(chatId)
	const { push } = useRouter()

	const setActiveChat = useChatStore(s => s.setActiveChat)

	const updateActiveChat = useEffectEvent((chat: AiChatRead | null | undefined) => {
		setActiveChat(chat)
	})

	useEffect(() => {
		if (isChatIdInAddressBar) {
			updateActiveChat(chat)
		}
	}, [isChatIdInAddressBar, chat])

	const selectChat = useCallback((chat: AiChatRead) => {
		if (chatId != null) {
			push(`/chat/${chat.id}`)
		} else {
			setActiveChat(chat)
		}
	}, [push, setActiveChat, chatId])

	return (
		<SidebarContext.Provider value={{ chatsQuery, pinnedChats, recentChats, selectChat }} >
			{children}
		</SidebarContext.Provider>
	)
}

export function useSidebar() {
	const context = useContext(SidebarContext)
	if (!context)
		throw new Error("useSidebar must be used within SidebarProvider")
	return context
}
