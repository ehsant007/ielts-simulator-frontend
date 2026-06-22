"use client"

import React, { forwardRef } from "react"
import { Button, ButtonProps } from "@chakra-ui/react"
import { Highlight } from "./store"
import { useLangToolsStore } from "./LangToolsProvider"


type HighlighterProps = {
	children: React.ReactNode
	id: string
}

export function Highlighter({ children, id }: HighlighterProps) {
	const highlights = useLangToolsStore((s) => s.highlights[id])

	return applyHighlights(children, highlights, (tokens, highlight) => (
		<span
			className="highlight"
			key={`hl-${tokens[0].key}`}
			data-group-id={highlight.groupId}
		>
			{tokens}
		</span>
	))
}

type TokenProps = {
	children?: React.ReactNode
	"data-token-index"?: string | number
}

/**
 * Optimized lookup using Binary Search.
 * Leverages the fact that highlights are sorted and merged (non-overlapping).
 */
function findHighlight(index: number, highlights: Highlight[]): Highlight | null {
	let low = 0;
	let high = highlights.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const range = highlights[mid];

		if (index >= range.from && index <= range.to) {
			return range; // Found the range containing this token
		} else if (index < range.from) {
			high = mid - 1; // Look in the left half
		} else {
			low = mid + 1; // Look in the right half
		}
	}

	return null;
}

/**
 * Helper to check if a React node is a token and should be highlighted.
 */
function getHighlight(node: React.ReactNode, highlights: Highlight[]): Highlight | null {
	if (!React.isValidElement<TokenProps>(node))
		return null;
	const index = node.props["data-token-index"];
	if (typeof index !== "number")
		return null;

	return findHighlight(index, highlights);
}

export function applyHighlights(
	root: React.ReactNode,
	highlights: Highlight[],
	wrapper: (tokens: React.ReactElement<TokenProps>[], highlight: Highlight) => React.ReactNode,
): React.ReactNode {
	if (!highlights || highlights.length === 0)
		return root

	if (
		root == null ||
		typeof root === "boolean" ||
		typeof root === "string" ||
		typeof root === "number"
	) {
		return root;
	}

	if (Array.isArray(root)) {
		const result: React.ReactNode[] = []

		for (let i = 0; i < root.length; i++) {
			const highlight = getHighlight(root[i], highlights)
			if (!highlight) {
				result.push(applyHighlights(root[i], highlights, wrapper))
				continue
			}

			const group = [root[i]]

			i++
			while (i < root.length) {
				if (getHighlight(root[i], highlights) !== highlight) {
					i--
					break
				}
				group.push(root[i])
				i++
			}

			result.push(wrapper(group, highlight))
		}

		return result
	}

	if (React.isValidElement<{ children?: React.ReactNode }>(root)) {

		const highlight = getHighlight(root, highlights)
		if (highlight)
			return wrapper([root], highlight)

		const children = applyHighlights(root.props.children, highlights, wrapper)
		if (children === root.props.children)
			return root
		return React.cloneElement(root, { children });
	}

	return root;
}


export const HighlightButton = forwardRef<HTMLButtonElement, ButtonProps>(({ children, onClick, ...props }, ref) => {
	const highlightSelectedText = useLangToolsStore((s) => s.highlightSelectedText)

	return (
		<Button
			onClick={(e) => {
				highlightSelectedText()
				onClick?.(e)
			}}
			ref={ref}
			{...props}
		>
			{children}
		</Button>
	)
})
HighlightButton.displayName = "HighlightButton"
