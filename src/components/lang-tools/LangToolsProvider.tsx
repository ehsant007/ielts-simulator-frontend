"use client"

import { createContext, useContext, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { createLangToolsStore, LangToolsStore } from "./store"
import { KokoroProvider } from "./kokoro-tts/KokoroProvider";
import { HighlightProvider } from "./highlighter";

const LangToolsContext = createContext<StoreApi<LangToolsStore> | undefined>(undefined)

type LangToolsProviderProps = {
	children: React.ReactNode,
}

export function LangToolsProvider({ children }: LangToolsProviderProps) {
	const [store] = useState(() => createLangToolsStore());


	return (
		<LangToolsContext.Provider value={store} >
			<HighlightProvider>
				<KokoroProvider>
					{children}
				</KokoroProvider>
			</HighlightProvider>
		</LangToolsContext.Provider>
	)
}

export function useLangToolsStore<T>(selector: (state: LangToolsStore) => T) {
	const store = useContext(LangToolsContext)
	if (!store)
		throw new Error("useLangToolsStore must be used within a LangToolsProvider")
	return useStore(store, selector)
}

export function useLangToolsStoreApi() {
	const store = useContext(LangToolsContext)
	if (!store)
		throw new Error("useLangToolsStoreApi must be used within a LangToolsProvider")
	return store
}
