"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { StoreApi, useStore } from "zustand";
import { createKokoroStore, type KokoroStore } from "./store"

const KokoroContext = createContext<StoreApi<KokoroStore> | undefined>(undefined)

type KokoroProviderProps = {
	children: React.ReactNode,
}

export function KokoroProvider({ children }: KokoroProviderProps) {
	const [store] = useState(() => createKokoroStore())
	const setLoadingProgress = useStore(store, (state) => state.setLoadingProgress)
	const setWorker = store.getState().setWorker

	useEffect(() => {
		const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })

		const onMessage = (e: MessageEvent) => {
			switch (e.data.type) {
				case "progress":
					setLoadingProgress(e.data.info)
					break
				case "ready":
					worker.removeEventListener("message", onMessage)
					break
			}
		}

		worker.addEventListener("message", onMessage)
		worker.postMessage({ type: "load" })

		setWorker(worker)

		return () => worker.terminate()
	}, [setLoadingProgress, setWorker])

	return (
		<KokoroContext.Provider value={store} >
			{children}
		</KokoroContext.Provider>
	)
}

export function useKokoroStore<T>(selector: (state: KokoroStore) => T) {
	const store = useContext(KokoroContext)
	if (!store)
		throw new Error("useKokoroStore must be used within a KokoroProvider")
	return useStore(store, selector)
}

export function useKokoroStoreApi() {
	const store = useContext(KokoroContext)
	if (!store)
		throw new Error("useKokoroStore must be used within a KokoroProvider")
	return store
}
