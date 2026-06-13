"use client"

import React, { useEffect, useState } from "react"
import { Box, Text as ChakraText, TextProps } from "@chakra-ui/react"
import { useModuleStore } from "./ModuleProvider"

function wrapText(text: string) {
	const setWordQuery = useModuleStore((state) => state.setWordQuery)

	return text.split(/(\s+)/).map((part, index) => {
		if (/^\s+$/.test(part))
			return part

		return (
			<span
				key={index}
				data-token-index={index}
				data-word={part}
				onPointerEnter={() => setWordQuery(part)}
			>
				{part}
			</span>
		)
	})
}

function tokenize(children: React.ReactNode): React.ReactNode {
	return React.Children.map(children, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			return wrapText(String(child))
		}

		if (React.isValidElement(child)) {
			const element = child as React.ReactElement<{ children?: React.ReactNode }>

			return React.cloneElement(element, {
				children: tokenize(element.props.children),
			})
		}

		return child
	})
}

export function Text({ children, ...props }: TextProps) {
	return (
		<ChakraText {...props}>
			<Highlighter>{tokenize(children)}</Highlighter>
		</ChakraText>
	)
}

type TextRange = {
	from: number
	to: number
}

function normalizeRanges(ranges: TextRange[]) {
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

export function Highlighter({ children }: { children: React.ReactNode }) {
	const [ranges, setRanges] = useState<TextRange[]>([])
	const rootRef = React.useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const onPointerUp = () => {
			const root = rootRef.current
			if (!root)
				return

			const range = selectionToRange(root)
			if (!range)
				return

			setRanges((prev) => normalizeRanges([...prev, range]))
		}

		document.addEventListener("pointerup", onPointerUp)
		return () => document.removeEventListener("pointerup", onPointerUp)
	}, [])

	const childrenArray = React.Children.toArray(children)
	const result: React.ReactNode[] = []

	let j = 0

	for (let i = 0; i < ranges.length; i++) {
		result.push(...childrenArray.slice(j, ranges[i].from))

		result.push(
			<Box as="span" bg="highlight" key={i}>
				{childrenArray.slice(ranges[i].from, ranges[i].to + 1)}
			</Box>
		)

		j = ranges[i].to + 1
	}

	result.push(...childrenArray.slice(j))

	return (
		<Box as="span" ref={rootRef}>
			{result}
		</Box>
	)
}