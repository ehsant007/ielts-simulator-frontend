import { createStore } from "zustand/vanilla"

export type Highlight = { groupId: number, from: number, to: number }

type Updater<T> = T | ((prev: T) => T)

export type LangToolsStore = {

	wordQuery: string
	setWordQuery: (value: string) => void

	highlights: Record<string, Highlight[]>,
	setHighlights: (
		id: string,
		highlights: Updater<Highlight[]>
	) => void

	highlightSelectedText: () => void
	removeHighlight: (groupId: number) => void

	highlightingEnabled: boolean,
	setHighlightingEnabled: (value: Updater<boolean>) => void
}

export function createLangToolsStore() {
	return createStore<LangToolsStore>((set, get) => (
		{
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

			highlightingEnabled: false,
			setHighlightingEnabled: (value) =>
				set((state) => ({
					highlightingEnabled: typeof value === "function" ? value(state.highlightingEnabled) : value
				})),

			highlightSelectedText: () => _highlightSelectedText(get().setHighlights),
			removeHighlight: (groupId) => _removeHighlight(get().highlights, get().setHighlights, groupId),
		}
	))
}



function addHighlight(ranges: Highlight[], range: Highlight) {
	if (ranges.length === 0)
		return [range]

	const result: Highlight[] = []

	let from = range.from
	const to = range.to
	let range_added = false

	for (let i = 0; i < ranges.length; i++) {

		if (range_added) {
			result.push(ranges[i])
			continue
		}

		if (from > ranges[i].to) {
			result.push(ranges[i])
			continue
		}

		if (from >= ranges[i].from) {
			from = ranges[i].to + 1
			result.push(ranges[i])

			if (from > to)
				range_added = true

			continue
		}

		// "from" doesn't intersect with ranges[i]

		if (to < ranges[i].from) {
			result.push({ groupId: range.groupId, from, to })
			result.push(ranges[i])
			range_added = true
			continue
		}

		if (to <= ranges[i].to) {
			result.push({ groupId: range.groupId, from, to: ranges[i].from - 1 })
			result.push(ranges[i])
			range_added = true
			continue
		}

		result.push({ groupId: range.groupId, from, to: ranges[i].from - 1 })
		result.push(ranges[i])
		from = ranges[i].to + 1
		if (from > to)
			range_added = true
	}

	if (!range_added && from <= to) {
		result.push({ groupId: range.groupId, from, to })
	}

	return result
}

function _removeHighlight(
	highlights: LangToolsStore["highlights"],
	setHighlights: LangToolsStore["setHighlights"],
	groupId: number,
) {
	for (const [id, hlArray] of Object.entries(highlights)) {
		const next = hlArray.filter((hl) => hl.groupId !== groupId)

		if (next.length !== hlArray.length) {
			setHighlights(id, next)
		}
	}
}



function getSelectedTokens(): HTMLElement[] {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return []
	}

	const range = selection.getRangeAt(0)
	const root = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
		? range.commonAncestorContainer
		: range.commonAncestorContainer.parentElement

	if (!(root instanceof HTMLElement))
		return []

	const result: HTMLElement[] = []

	if (root.hasAttribute("data-token-index") && range.intersectsNode(root)) {
		result.push(root)
		return result
	}

	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_ELEMENT,
		{
			acceptNode(node) {
				const el = node as HTMLElement

				if (!el.hasAttribute("data-token-index")) {
					return NodeFilter.FILTER_SKIP
				}

				return range.intersectsNode(el)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_SKIP
			},
		},
	)

	let node = walker.nextNode()
	while (node) {
		result.push(node as HTMLElement)
		node = walker.nextNode()
	}

	return result
}


function getSelectedTokensGroupByAdvText() {
	return getSelectedTokens().reduce<Record<string, HTMLElement[]>>((result, token) => {
		const advTextId = token.closest("[data-advtext-id]")?.getAttribute("data-advtext-id")
		if (!advTextId)
			return result;

		(result[advTextId] ??= []).push(token)
		return result
	}, {})
}


let nextGroupId = 0
function _highlightSelectedText(setHighlights: LangToolsStore["setHighlights"]) {
	const tokens = getSelectedTokensGroupByAdvText()

	Object.keys(tokens).forEach((advTextId) => {
		const group = tokens[advTextId]
		const from = group[0].dataset.tokenIndex
		const to = group[group.length - 1].dataset.tokenIndex

		if (from == null || to == null)
			return

		const range: Highlight = {
			groupId: nextGroupId++,
			from: Number(from),
			to: Number(to),
		}

		setHighlights(advTextId, (prev) => addHighlight(prev, range))
	})

	// Clear selection
	const selection = window.getSelection()

	if (selection && !selection.isCollapsed) {
		selection.removeAllRanges()
	}
}