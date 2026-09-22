"use client"

import { createContext, useContext, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ChatStore, createChatStore } from "./store"

const ChatStoreContext = createContext<StoreApi<ChatStore> | undefined>(undefined)

type ChatStoreProviderProps = {
	children: React.ReactNode,
	initialChatId?: string
}

export function ChatStoreProvider({ children, initialChatId }: ChatStoreProviderProps) {
	const [store] = useState(() => createChatStore(initialChatId))

	return (
		<ChatStoreContext.Provider value={store} >
			{children}
		</ChatStoreContext.Provider>
	)
}

export function useChatStore<T>(selector: (state: ChatStore) => T) {
	const store = useContext(ChatStoreContext)
	if (!store)
		throw new Error("useChatStore must be used within ChatStoreProvider")
	return useStore(store, selector)
}

export function useChatStoreApi() {
	const store = useContext(ChatStoreContext)
	if (!store)
		throw new Error("useChatStoreApi must be used within ChatStoreProvider")
	return store
}
