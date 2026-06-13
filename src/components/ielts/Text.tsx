"use client"

import React, {useState } from "react"
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
			<Highlighter>
				{tokenize(children)}
			</Highlighter>
		</ChakraText>
	)
}


type TextRange = {
	from: number,
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


export function Highlighter({ children }: { children: React.ReactNode }) {
	const [ranges, setRanges] = useState<TextRange[]>([{ from: 0, to: 2 }])

	const addHighlight = (range: TextRange) => {
		setRanges(prev => normalizeRanges([...prev, range]))
	}

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

	return <>
		{result}
	</>
}
