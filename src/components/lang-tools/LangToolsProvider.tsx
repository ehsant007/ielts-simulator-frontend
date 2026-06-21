"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { createLangToolsStore, LangToolsStore } from "./store"
import { highlightSelectedText } from "./Highlighter";

const LangToolsContext = createContext<StoreApi<LangToolsStore> | undefined>(undefined)

type LangToolsProviderProps = {
	children: React.ReactNode,
}

export function LangToolsProvider({ children }: LangToolsProviderProps) {
	const [store] = useState(() => createLangToolsStore());
	const highlightingEnabled = useStore(store, (state) => state.highlightingEnabled)
	const setHighlights = store.getState().setHighlights

	useEffect(() => {
		if (!highlightingEnabled)
			return

		const onPointerUp = () => {
			highlightSelectedText({ setHighlights })
		}

		document.addEventListener("pointerup", onPointerUp)
		return () => document.removeEventListener("pointerup", onPointerUp)
	}, [highlightingEnabled, setHighlights])

	return (
		<LangToolsContext.Provider value={store} >
			{children}
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
