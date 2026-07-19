import { createStore } from "zustand/vanilla"

export type LangToolsStore = {

	wordQuery: string | null
	setWordQuery: (value: string | null) => void

	translateHistory: Map<string, number>

	copiedText: string | null
	setCopiedText: (value: string) => void
}

export function createLangToolsStore() {
	return createStore<LangToolsStore>((set) => (
		{
			translateHistory: new Map(),
			wordQuery: null,
			setWordQuery: (value) =>
				set((state) => ({
					wordQuery: value,
					translateHistory: value
						? new Map(state.translateHistory).set(value, Date.now())
						: state.translateHistory,
				})),

			copiedText: null,
			setCopiedText: (value) => set(() => ({ copiedText: value })),
		}
	))
}