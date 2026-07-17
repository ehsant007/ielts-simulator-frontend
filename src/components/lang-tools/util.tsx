
export function getSelection1() {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return null
	}

	return selection
}


export function getHighlightGroupId(target: EventTarget): number | null {
	if (target instanceof HTMLElement) {
		let node: HTMLElement | null = target
		while (node != null) {
			if (node.hasAttribute("data-group-id"))
				break
			node = node.parentElement
		}
		if (node) {
			const groupId = node.dataset.groupId
			if (groupId)
				return Number(groupId)
		}
	}

	return null
}


export function getTokenWord(target: EventTarget): string | null {
	if (!(target instanceof HTMLElement))
		return null

	if (!target.hasAttribute("data-word"))
		return null

	return target.dataset.word ?? null
}

