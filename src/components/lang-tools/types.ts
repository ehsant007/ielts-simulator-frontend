export type Highlight = { from: number, to: number }

export type HighlightSlice = {
	highlights: Record<string, Array<Highlight>>,
	setHighlights: (
		id: string,
		highlights: Array<Highlight> | ((prev: Array<Highlight>) => Array<Highlight>)
	) => void
}


export function createHighlightSlice(
	set: (fn: (state: HighlightSlice) => Pick<HighlightSlice, "highlights">) => void,
	get: () => { highlights: Record<string, Array<Highlight>> },
): HighlightSlice {
	return {
		highlights: {},
		setHighlights: (id, highlights) => set((state) => ({ highlights: { ...state.highlights, [id]: typeof highlights === "function" ? highlights(state.highlights[id] ?? []) : highlights } }))
	}
}
