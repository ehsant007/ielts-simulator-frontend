import { createStore } from "zustand/vanilla"

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

	cache: Record<string, ArrayBuffer>
	addToCache: (text: string, speech: ArrayBuffer) => void
	loadingProgress: KokoroLoadingProgressInfo | null
	setLoadingProgress: (value: KokoroLoadingProgressInfo) => void
	generate: (text: string) => Promise<ArrayBuffer>
	inferencing: boolean
	setInferencing: (value: boolean) => void
}

function generate(worker: Worker, text: string): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		worker.postMessage({ type: "generate", text });

		const onMessage = (event: MessageEvent) => {
			worker.removeEventListener("message", onMessage)
			resolve(event.data);
		};

		const onError = (error: ErrorEvent) => {
			worker.removeEventListener("error", onError)
			reject(error);
		};

		worker.addEventListener("message", onMessage)
		worker.addEventListener("error", onError)
	});
}


export function createKokoroStore() {
	return createStore<KokoroStore>((set, get) => ({
		worker: null,
		setWorker: (worker) => set({ worker }),

		cache: {},
		addToCache: (text, speech) => set((state) => ({ cache: { ...state.cache, [text]: speech } })),
		loadingProgress: null,
		setLoadingProgress: (value) => set({ loadingProgress: value }),
		inferencing: false,
		setInferencing: (value) => set({ inferencing: value }),

		generate: (text) => {
			const result = get().cache[text]
			get().setInferencing(true)
			return new Promise((resolve, reject) => {
				if (result) {
					resolve(result)
					return
				}

				const onMessage = (e: MessageEvent) => {
					if (e.data.type !== "result")
						return
					get().worker?.removeEventListener("message", onMessage)
					get().addToCache(e.data.text, e.data.wav)
					get().setInferencing(false)
					resolve(e.data.wav)
				}

				const onError = (error: ErrorEvent) => {
					get().worker?.removeEventListener("error", onError)
					reject(error)
				}

				get().worker?.addEventListener("message", onMessage)
				get().worker?.addEventListener("error", onError)

				get().worker?.postMessage({ type: "generate", text })
			})
		},

	}))
}
