"use client"

import React from "react"

function wrapText(
	text: string,
	nextTokenIndex: () => number,
	setWordQuery: (value: string) => void,
): React.ReactNode {

	const re = /\{\{q\d+\}\}/
	const match = re.exec(text)

	if (match) {
		return [
			wrapText(text.slice(0, match.index), nextTokenIndex, setWordQuery),
			match[0],
			wrapText(text.slice(match.index + match[0].length), nextTokenIndex, setWordQuery)
		]
	}

	const parts = text.match(/\s+|[\p{L}\p{N}]+|[^\p{L}\p{N}\s]/gu)
	if (!parts)
		return text

	return parts.map((part) => {
		const isWord = !/^\s+$/.test(part)
		const tokenIndex = nextTokenIndex()

		return (
			<span
				key={`token-${tokenIndex}`}
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

export function tokenizer(
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
				children: tokenizer(element.props.children, nextTokenIndex, setWordQuery),
			})
		}

		return child
	})
}
