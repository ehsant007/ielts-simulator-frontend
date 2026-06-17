"use client"

import React, { useEffect } from "react"
import { Box } from "@chakra-ui/react"
import { Highlight, LangToolsSlice } from "./store"
import { useLangToolStore } from "./hooks"


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
}

export function Highlighter({ children, id }: HighlighterProps) {
	const highlightingEnabled = useLangToolStore((state) => state.highlightingEnabled)
	const highlights = useLangToolStore((s) => s.highlights)[id] ?? []
	const setHighlights = useLangToolStore((s) => s.setHighlights)

	const rootRef = React.useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if(!highlightingEnabled)
			return

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
	}, [id, highlightingEnabled])


	return (
		<Box as="span" ref={rootRef}>
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
function isIndexHighlighted(index: number, highlights: Highlight[]): boolean {
	let low = 0;
	let high = highlights.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const range = highlights[mid];

		if (index >= range.from && index <= range.to) {
			return true; // Found the range containing this token
		} else if (index < range.from) {
			high = mid - 1; // Look in the left half
		} else {
			low = mid + 1; // Look in the right half
		}
	}

	return false;
}

/**
 * Helper to check if a React node is a token and should be highlighted.
 */
function isHighlightedToken(node: React.ReactNode, highlights: Highlight[]): boolean {
	if (!React.isValidElement<TokenProps>(node)) return false;
	const index = node.props["data-token-index"];
	if (typeof index !== "number")
		return false;

	return isIndexHighlighted(index, highlights);
}

export function applyHighlights(root: React.ReactNode, highlights: Highlight[]): React.ReactNode {
	// 1. Check for primitives and nulls
	if (
		root == null ||
		typeof root === "boolean" ||
		typeof root === "string" ||
		typeof root === "number"
	) {
		return root;
	}

	// 2. Handle Arrays of children with Grouping Logic
	if (Array.isArray(root)) {
		const result: React.ReactNode[] = [];
		let i = 0;

		while (i < root.length) {
			const child = root[i];

			if (isHighlightedToken(child, highlights)) {
				// --- GROUPING START ---
				const group: React.ReactNode[] = [];

				// Collect all contiguous siblings that are also highlighted tokens
				while (i < root.length && isHighlightedToken(root[i], highlights)) {
					// We recurse into the token itself just in case it has children 
					// that need highlighting deep inside, though typically tokens are leaves.
					group.push(applyHighlights(root[i], highlights));
					i++;
				}

				// Wrap the entire contiguous group in a single Box
				result.push(
					<Box as="span" bg="highlight" key={`hl-group-${i}`}>
						{group}
					</Box>
				);
				// --- GROUPING END ---
			} else {
				// Not a highlighted token, just process it recursively and move on
				result.push(applyHighlights(child, highlights));
				i++;
			}
		}
		return result;
	}

	// 3. Handle Single React Elements
	if (React.isValidElement(root)) {
		const element = root as React.ReactElement<{children?: React.ReactNode}>;
		const { props } = element;

		// If this is a token but we reached it via the "Single Element" path,
		// it means it's either already grouped or isolated. 
		// We only need to handle the recursive step for its children here.
		if (props.children != null) {
			return React.cloneElement(element, {
				children: applyHighlights(props.children, highlights),
			});
		}
	}

	return root;
}