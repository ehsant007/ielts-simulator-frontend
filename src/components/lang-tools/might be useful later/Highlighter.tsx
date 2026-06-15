"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import { Box, Text, type TextProps as ChakraTextProps } from "@chakra-ui/react"

type TextRange = {
	from: number
	to: number
}

type TextProps = {
	children: React.ReactNode
} & Omit<ChakraTextProps, "children">

function normalizeRanges(ranges: TextRange[]) {
	if (ranges.length === 0) return []

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

function splitTextByRanges(
	text: string,
	absoluteStart: number,
	ranges: TextRange[],
	keyPrefix: string
): React.ReactNode[] {
	const absoluteEnd = absoluteStart + text.length
	const relevant = ranges.filter(
		(range) => range.from < absoluteEnd && range.to > absoluteStart
	)

	if (relevant.length === 0) return [text]

	const nodes: React.ReactNode[] = []
	let cursor = 0

	for (let i = 0; i < relevant.length; i++) {
		const range = relevant[i]
		const localFrom = Math.max(range.from, absoluteStart) - absoluteStart
		const localTo = Math.min(range.to, absoluteEnd) - absoluteStart

		if (localFrom > cursor) {
			nodes.push(text.slice(cursor, localFrom))
		}

		nodes.push(
			<Text
				key={`${keyPrefix}-hl-${i}-${localFrom}-${localTo}`}
				bg="highlight"
				as="span"
			>
				{text.slice(localFrom, localTo)}
			</Text>
		)

		cursor = Math.max(cursor, localTo)
	}

	if (cursor < text.length) {
		nodes.push(text.slice(cursor))
	}

	return nodes
}

function renderRecursive(
	node: React.ReactNode,
	ranges: TextRange[],
	offsetRef: { current: number },
	path: string
): React.ReactNode[] {
	const output: React.ReactNode[] = []

	React.Children.forEach(node, (child, index) => {
		const key = `${path}-${index}`

		if (child === null || child === undefined || typeof child === "boolean") {
			return
		}

		if (typeof child === "string" || typeof child === "number") {
			const text = String(child)
			const start = offsetRef.current

			output.push(...splitTextByRanges(text, start, ranges, key))

			offsetRef.current += text.length
			return
		}

		if (React.isValidElement(child)) {
			type ChildProps = {
				children?: React.ReactNode
				[key: string]: unknown
			}

			const element = child as React.ReactElement<ChildProps>

			if (element.type === "br") {
				output.push(<br key={key} />)
				offsetRef.current += 1
				return
			}

			const nested = renderRecursive(
				element.props.children,
				ranges,
				offsetRef,
				key
			)

			output.push(
				React.cloneElement(
					element,
					{ key },
					...nested
				)
			)
		}
	})

	return output
}

export function Highlighter({ children, ...props }: TextProps) {
	const ref = useRef<HTMLDivElement | null>(null)
	const [highlights, setHighlights] = useState<TextRange[]>([])

	const normalizedHighlights = useMemo(
		() => normalizeRanges(highlights),
		[highlights]
	)

	const getSelectionRange = useCallback(() => {
		const container = ref.current
		const selection = window.getSelection()

		if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
			return null
		}

		const range = selection.getRangeAt(0)

		if (!container.contains(range.commonAncestorContainer)) {
			return null
		}

		const preRange = document.createRange()
		preRange.selectNodeContents(container)
		preRange.setEnd(range.startContainer, range.startOffset)

		const from = preRange.toString().length
		const to = from + range.toString().length

		if (from === to) return null

		return { from, to }
	}, [])

	const handleMouseUp = useCallback(() => {
		const next = getSelectionRange()

		if (!next) return

		setHighlights((prev) => normalizeRanges([...prev, next]))
		window.getSelection()?.removeAllRanges()
	}, [getSelectionRange])

	const renderedChildren = useMemo(() => {
		const offsetRef = { current: 0 }
		return renderRecursive(children, normalizedHighlights, offsetRef, "text")
	}, [children, normalizedHighlights])

	return (
		<Box
			ref={ref}
			as="div"
			onMouseUp={handleMouseUp}
			userSelect="text"
			cursor="text"
			{...props}
		>
			{renderedChildren}
		</Box>
	)
}