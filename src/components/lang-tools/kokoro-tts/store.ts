import { createStore } from "zustand/vanilla"
import { KokoroOutput } from "./types"

export type KokoroLoadingProgressInfo = {
	name: string
	file: string
	status: string
	loaded: number
	total: number
	progress: number
}

export type KokoroStore = {
	worker: Worker | null
	setWorker: (worker: Worker) => void

	cache: Record<string, KokoroOutput[]>
	addToCache: (text: string, audio: KokoroOutput) => void
	loadingProgress: KokoroLoadingProgressInfo | null
	setLoadingProgress: (value: KokoroLoadingProgressInfo) => void
	generate: (text: string, onResult?: (audio: KokoroOutput[]) => void, stream?: boolean) => Promise<KokoroOutput[]>
	inferencing: boolean
	setInferencing: (value: boolean) => void
}


export function createKokoroStore() {
	return createStore<KokoroStore>((set, get) => ({
		worker: null,
		setWorker: (worker) => set({ worker }),

		cache: {},
		addToCache: (text, audio) => set((state) => ({ cache: { ...state.cache, [text]: [...(state.cache[text] ?? []), audio] } })),

		loadingProgress: null,
		setLoadingProgress: (value) => set({ loadingProgress: value }),
		inferencing: false,
		setInferencing: (value) => set({ inferencing: value }),

		generate: (text, onResult, stream) => {
			const result = get().cache[text]
			get().setInferencing(true)
			return new Promise((resolve, reject) => {
				if (result) {
					onResult?.(result)
					resolve(result)
					return
				}

				const onMessage = (e: MessageEvent) => {
					const msgType: string = e.data.type

					if (!stream || msgType === "stream-done")
						get().worker?.removeEventListener("message", onMessage)

					if (msgType !== "result")
						return

					const audio: KokoroOutput = e.data.audio

					get().addToCache(e.data.text, audio)
					get().setInferencing(false)
					const result = [audio]
					onResult?.(result)
					resolve(result)
				}

				const onError = (error: ErrorEvent) => {
					get().worker?.removeEventListener("error", onError)
					reject(error)
				}

				get().worker?.addEventListener("message", onMessage)
				get().worker?.addEventListener("error", onError)

				if (stream)
					get().worker?.postMessage({ type: "stream", text })
				else
					get().worker?.postMessage({ type: "generate", text })
			})
		},

	}))
}
