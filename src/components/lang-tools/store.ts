export type Highlight = { from: number, to: number }

type Updater<T> = T | ((prev: T) => T)

export type LangToolsSlice = {

	wordQuery: string
	setWordQuery: (value: string) => void

	highlights: Record<string, Array<Highlight>>,
	setHighlights: (
		id: string,
		highlights: Updater<Highlight[]>
	) => void

	highlightingEnabled: boolean,
	setHighlightingEnabled: (value: Updater<boolean>) => void
}


export function createLangToolsSlice(
	set: (fn: (state: LangToolsSlice) => Partial<LangToolsSlice>) => void,
	//get: () => { highlights: Record<string, Array<Highlight>> },
): LangToolsSlice {
	return {
		wordQuery: "",
		setWordQuery: (value) => set(() => ({ wordQuery: value })),

		highlights: {},
		setHighlights: (id, highlights) =>
			set((state) => ({
				highlights: {
					...state.highlights,
					[id]:
						typeof highlights === "function"
							? highlights(state.highlights[id] ?? [])
							: highlights
				}
			}
			)),

		highlightingEnabled: true,
		setHighlightingEnabled: (value) =>
			set((state) => ({
				highlightingEnabled: typeof value === "function" ? value(state.highlightingEnabled) : value
			})),
	}
}
