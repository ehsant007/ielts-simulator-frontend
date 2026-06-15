"use client"

import React, { useEffect } from "react"
import { Box, Text as ChakraText, TextProps } from "@chakra-ui/react"
import { useModuleStore } from "./ModuleProvider"

function wrapText(
	text: string,
	nextTokenIndex: () => number,
	setWordQuery: (value: string) => void,
) {
	return text.match(/\s+|[\p{L}\p{N}]+|[^\p{L}\p{N}\s]/gu)?.map((part) => {
		const isWord = !/^\s+$/.test(part)
		const tokenIndex = nextTokenIndex()

		return (
			<span
				key={tokenIndex}
				data-token-index={tokenIndex}
				{...(isWord ?
					{
						"data-word": part,
						onPointerEnter: () => setWordQuery(part),
					}
					: {}
				)
				}
			>
				{part}
			</span>
		)
	})
}

function tokenize(
	children: React.ReactNode,
	nextTokenIndex: () => number,
	setWordQuery: (value: string) => void,
): React.ReactNode {
	return React.Children.map(children, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			return wrapText(String(child), nextTokenIndex, setWordQuery)
		}

		if (React.isValidElement(child)) {
			const element = child as React.ReactElement<{ children?: React.ReactNode }>

			return React.cloneElement(element, {
				children: tokenize(element.props.children, nextTokenIndex, setWordQuery),
			})
		}

		return child
	})
}

export function Text({ children, id, ...props }: TextProps) {
	const setWordQuery = useModuleStore((state) => state.setWordQuery)
	const highlights = useModuleStore((state) => state.highlights)
	const setHighlights = useModuleStore((state) => state.setHighlights)

	const tokenIndex = React.useRef(0)
	tokenIndex.current = 0
	const nextTokenIndex = () => tokenIndex.current++

	return (
		<ChakraText {...props}>
			{id ? (
				<Highlighter
					id={id}
					highlights={highlights}
					setHighlights={setHighlights}
				>
					{tokenize(children, nextTokenIndex, setWordQuery)}
				</Highlighter>
			) : (
				tokenize(children, nextTokenIndex, setWordQuery)
			)}
		</ChakraText>
	)
}

type TextRange = {
	from: number
	to: number
}

function normalizeHighlights(ranges: TextRange[]) {
	if (ranges.length === 0)
		return []

	const sorted = [...ranges].sort((a, b) => a.from - b.from)
	const merged: TextRange[] = [sorted[0]]

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

function selectionToRange(root: HTMLElement): TextRange | null {
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

			const range = selectionToRange(root)
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


type Highlight = { from: number, to: number }

type HighlightSlice = {
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
