"use client"

import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { chatsQueryKey } from "./hooks";
import { AiChatRead, readChats } from "@/client";


type SidebarContextType = {
	chatsQuery: UseInfiniteQueryResult<InfiniteData<AiChatRead[], unknown>, Error>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode,
	chatId?: string
}

export function SidebarProvider({ children }: SidebarProps) {

	const chatsQuery = useInfiniteQuery({
		queryKey: chatsQueryKey,

		queryFn: ({ pageParam }) => readChats({
			query: {
				...pageParam,
				limit: 3,
			}
		}).then((res) => res.data),

		initialPageParam: {},

		getPreviousPageParam: (firstPage) =>
			firstPage.length > 0
				? { after: firstPage[0].last_active }
				: undefined,

		getNextPageParam: (lastPage) =>
			lastPage.length > 0
				? { before: lastPage[lastPage.length - 1].last_active }
				: undefined,
	})

	return (
		<SidebarContext.Provider value={{ chatsQuery }} >
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
