"use client"

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useEffectEvent } from "react";
import { useChatsQuery } from "./hooks";
import { AiChatRead, AiChatPage } from "@/client";
import { useChatStore } from "./ChatProvider";


type SidebarContextType = {
	chatsQuery: UseInfiniteQueryResult<InfiniteData<AiChatPage, unknown>, Error>
	pinnedChats: AiChatRead[]
	recentChats: AiChatRead[]
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProps) {

	const { chatsQuery, pinnedChats, recentChats } = useChatsQuery()

	return (
		<SidebarContext.Provider value={{ chatsQuery, pinnedChats, recentChats }} >
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
