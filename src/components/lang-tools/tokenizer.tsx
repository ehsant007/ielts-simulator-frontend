"use client"

import React from "react"

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
