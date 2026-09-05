"use client"

import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useChats2 } from "./hooks";
import { AiChatRead } from "@/client";


type SidebarContextType = {
	chatsQuery: UseInfiniteQueryResult<InfiniteData<AiChatRead[], unknown>, Error>
	pinnedChats: AiChatRead[],
	recentChats: AiChatRead[],
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode,
	chatId?: string,
}

export function SidebarProvider({ children }: SidebarProps) {

	const { query: chatsQuery, pinnedChats, recentChats } = useChats2()


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
