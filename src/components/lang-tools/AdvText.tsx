"use client"

import React from "react"
import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { HighlightSlice } from "./types"
import { Highlighter } from "./Highlighter"
import {tokenizer} from "./tokenizer"

type AdvTextProps = {
	onWordPointed: (value: string) => void
} & TextProps & HighlightSlice

export function AdvText({ children, id, onWordPointed, highlights, setHighlights, ...props }: AdvTextProps) {
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
					{tokenizer(children, nextTokenIndex, onWordPointed)}
				</Highlighter>
			) : (
				tokenizer(children, nextTokenIndex, onWordPointed)
			)}
		</ChakraText>
	)
}

