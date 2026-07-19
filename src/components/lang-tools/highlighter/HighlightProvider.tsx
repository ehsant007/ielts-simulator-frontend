"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { createHighlightStore, HighlightStore } from "./store"

const HighlightContext = createContext<StoreApi<HighlightStore> | undefined>(undefined)

type LangToolsProviderProps = {
	children: React.ReactNode,
}

export function HighlightProvider({ children }: LangToolsProviderProps) {
	const [store] = useState(() => createHighlightStore());
	const highlightingEnabled = useStore(store, (state) => state.highlightingEnabled)
	const highlightSelectedText = store.getState().highlightSelectedText

	useEffect(() => {
		if (!highlightingEnabled)
			return

		document.addEventListener("pointerup", highlightSelectedText)
		return () => document.removeEventListener("pointerup", highlightSelectedText)
	}, [highlightingEnabled, highlightSelectedText])

	return (
		<HighlightContext.Provider value={store} >
				{children}
		</HighlightContext.Provider>
	)
}

export function useHighlightStore<T>(selector: (state: HighlightStore) => T) {
	const store = useContext(HighlightContext)
	if (!store)
		throw new Error("useHighlightStore must be used within a HighlightProvider")
	return useStore(store, selector)
}

export function useHighlightStoreApi() {
	const store = useContext(HighlightContext)
	if (!store)
		throw new Error("useHighlightStoreApi must be used within a HighlightProvider")
	return store
}
