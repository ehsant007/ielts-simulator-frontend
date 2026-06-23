
export function getSelectedText() {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return null
	}

	return selection.toString()
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

