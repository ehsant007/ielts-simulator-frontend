"use client"

import React from "react"

type TokenWrapper = (token: string, index: number, isWord: boolean) => React.ReactNode

function wrapText(
	text: string,
	wrapper: TokenWrapper,
	nextTokenIndex: () => number,
): React.ReactNode {

	const re = /\{\{q\d+\}\}/
	const match = re.exec(text)

	if (match) {
		return [
			wrapText(text.slice(0, match.index), wrapper, nextTokenIndex),
			match[0],
			wrapText(text.slice(match.index + match[0].length), wrapper, nextTokenIndex)
		]
	}

	const tokens = text.match(/\s+|[\p{L}\p{N}]+|[^\p{L}\p{N}\s]/gu)
	if (!tokens)
		return text

	return tokens.map((token) => {
		const isWord = !/^\s+$/.test(token)
		const index = nextTokenIndex()
		return wrapper(token, index, isWord)
	})
}


function rTokenize(
	children: React.ReactNode,
	wrapper: TokenWrapper,
	nextTokenIndex: () => number,
): React.ReactNode {
	return React.Children.map(children, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			return wrapText(String(child), wrapper, nextTokenIndex)
		}

		if (React.isValidElement(child)) {
			const element = child as React.ReactElement<{ children?: React.ReactNode }>

			return React.cloneElement(element, {
				children: rTokenize(element.props.children, wrapper, nextTokenIndex),
			})
		}

		return child
	})
}


export function tokenize(
	children: React.ReactNode,
	wrapper: TokenWrapper,
): React.ReactNode {
	let tokenIndex = 0
	const nextTokenIndex = () => tokenIndex++
	return rTokenize(children, wrapper, nextTokenIndex)
}

