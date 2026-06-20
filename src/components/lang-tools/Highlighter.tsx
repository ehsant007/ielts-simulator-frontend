"use client"

import React, { forwardRef } from "react"
import { Box, Button, ButtonProps } from "@chakra-ui/react"
import { Highlight, LangToolsStore } from "./store"
import { useLangToolsStore } from "./LangToolsProvider"


function addHighlight(ranges: Highlight[], range: Highlight) {
	if (ranges.length === 0)
		return [range]

	const result: Highlight[] = []

	let from = range.from
	let to = range.to
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

export function removeHighlight({ highlights, setHighlights }: LangToolsStore, groupId: number) {
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
export function highlightSelectedText({ setHighlights }: Pick<LangToolsStore, "setHighlights">) {
	const tokens = getSelectedTokensGroupByAdvText()
	const groupId = nextGroupId++

	Object.keys(tokens).forEach((advTextId) => {
		const group = tokens[advTextId]
		const from = group[0].dataset.tokenIndex
		const to = group[group.length - 1].dataset.tokenIndex

		if (from == null || to == null)
			return

		const range: Highlight = {
			groupId,
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


type HighlighterProps = {
	children: React.ReactNode
	id: string
}

export function Highlighter({ children, id }: HighlighterProps) {
	const highlights = useLangToolsStore((s) => s.highlights[id]) ?? []

	return (
		<Box as="span">
			{applyHighlights(children, highlights)}
		</Box>
	)
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

export function applyHighlights(root: React.ReactNode, highlights: Highlight[]): React.ReactNode {

	if (
		root == null ||
		typeof root === "boolean" ||
		typeof root === "string" ||
		typeof root === "number"
	) {
		return root;
	}

	if (Array.isArray(root)) {
		return root.map((child) => {
			return applyHighlights(child, highlights)
		})
	}

	if (React.isValidElement<{ children?: React.ReactNode }>(root)) {

		const highlight = getHighlight(root, highlights)
		if (highlight) {
			return (
				<Box
					as="span"
					bg="highlight"
					key={`hl-${root.key}`}
					data-group-id={highlight.groupId}
				>
					{root}
				</Box>
			)
		}

		const children = applyHighlights(root.props.children, highlights)
		if (children === root.props.children)
			return root
		return React.cloneElement(root, { children });
	}

	return root;
}


export const HighlightButton = forwardRef<HTMLButtonElement, ButtonProps>(({ children, onClick, ...props }, ref) => {
	const setHighlights = useLangToolsStore((s) => s.setHighlights)

	return (
		<Button
			onClick={(e) => {
				highlightSelectedText({ setHighlights })
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
