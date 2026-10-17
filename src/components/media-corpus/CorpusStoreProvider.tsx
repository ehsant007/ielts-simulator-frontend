import { createContext, useContext, useState } from "react";
import { CorpusStore, createCorpusStore } from "./store";
import { StoreApi, useStore } from "zustand";


const CorpusStoreContext = createContext<StoreApi<CorpusStore> | undefined>(undefined)

type CorpusStoreProviderProps = {
	children: React.ReactNode
}

export function CorpusStoreProvider({ children }: CorpusStoreProviderProps) {
	const [store] = useState(() => createCorpusStore())

	return (
		<CorpusStoreContext.Provider value={store} >
			{children}
		</CorpusStoreContext.Provider>
	)
}


export function useCorpusStore<T>(selector: (state: CorpusStore) => T) {
	const store = useContext(CorpusStoreContext)
	if (!store)
		throw new Error("useCorpusStore must be used within CorpusStoreProvider")
	return useStore(store, selector)
}

export function useCorpusStoreApi() {
	const store = useContext(CorpusStoreContext)
	if (!store)
		throw new Error("useCorpusStoreApi must be used within CorpusStoreProvider")
	return store
}
