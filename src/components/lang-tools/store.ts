import { createStore } from "zustand/vanilla"

export type LangToolsStore = {

	wordQuery: string | null
	setWordQuery: (value: string | null, updateHistory?: boolean) => void

	translateHistory: string[]

	copiedText: string | null
	setCopiedText: (value: string) => void
}

export function createLangToolsStore() {
	return createStore<LangToolsStore>((set) => (
		{
			translateHistory: [],
			wordQuery: null,
			setWordQuery: (value, updateHistory=true) =>
				set((state) => ({
					wordQuery: value,
					translateHistory: updateHistory && value ? [value, ...state.translateHistory.filter((v) => v != value)] : state.translateHistory,
				})),

			copiedText: null,
			setCopiedText: (value) => set(() => ({ copiedText: value })),
		}
	))
}