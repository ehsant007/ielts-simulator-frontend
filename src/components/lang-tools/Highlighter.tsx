"use client"

import React, { useEffect } from "react"
import { Box } from "@chakra-ui/react"
import { Highlight, HighlightSlice } from "./types"


function normalizeHighlights(ranges: Highlight[]) {
	if (ranges.length === 0)
		return []

	const sorted = [...ranges].sort((a, b) => a.from - b.from)
	const merged: Highlight[] = [sorted[0]]

	for (let i = 1; i < sorted.length; i++) {
		const prev = merged[merged.length - 1]
		const current = sorted[i]

		if (current.from <= prev.to) {
			prev.to = Math.max(prev.to, current.to)
		} else {
			merged.push({ ...current })
		}
	}

	return merged
}

function selectionToHighlight(root: HTMLElement): Highlight | null {
	const selection = window.getSelection()

	if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
		return null

	const nativeRange = selection.getRangeAt(0)
	// if (!root.contains(nativeRange.commonAncestorContainer))
	// 	return null

	const tokens = Array.from(root.querySelectorAll<HTMLElement>("[data-token-index]"))
	const selected = tokens.filter((node) => nativeRange.intersectsNode(node))

	if (selected.length === 0)
		return null

	const from = Number(selected[0].dataset.tokenIndex)
	const to = Number(selected[selected.length - 1].dataset.tokenIndex)

	return { from, to }
}

type HighlighterProps = {
	children: React.ReactNode
	id: string
} & HighlightSlice

export function Highlighter({ children, id, highlights, setHighlights }: HighlighterProps) {
	const myHighlights = highlights[id] ?? []
	const rootRef = React.useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const onPointerUp = () => {
			const root = rootRef.current
			if (!root)
				return

			const range = selectionToHighlight(root)
			if (!range)
				return

			setHighlights(id, prev => normalizeHighlights([...prev, range]))
		}

		document.addEventListener("pointerup", onPointerUp)
		return () => document.removeEventListener("pointerup", onPointerUp)
	}, [])

	const childrenArray = React.Children.toArray(children)
	const result: React.ReactNode[] = []

	let j = 0

	for (let i = 0; i < myHighlights.length; i++) {
		result.push(...childrenArray.slice(j, myHighlights[i].from))

		result.push(
			<Box as="span" bg="highlight" key={i}>
				{childrenArray.slice(myHighlights[i].from, myHighlights[i].to + 1)}
			</Box>
		)

		j = myHighlights[i].to + 1
	}

	result.push(...childrenArray.slice(j))

	return (
		<Box as="span" ref={rootRef}>
			{result}
		</Box>
	)
}


