"use client"

import { createContext, useContext, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ChatStore, createChatStore } from "./store"
import { ChatProvider } from "./ChatProvider";

const ChatStoreContext = createContext<StoreApi<ChatStore> | undefined>(undefined)

type ChatStoreProviderProps = {
	children: React.ReactNode,
}

export function ChatStoreProvider({ children }: ChatStoreProviderProps) {
	const [store] = useState(() => createChatStore());


	return (
		<ChatStoreContext.Provider value={store} >
			<ChatProvider>
				{children}
			</ChatProvider>
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
