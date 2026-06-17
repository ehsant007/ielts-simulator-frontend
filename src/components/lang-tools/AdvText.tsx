"use client"

import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { HighlightSlice } from "./types"
import { Highlighter } from "./Highlighter"
import { tokenizer } from "./tokenizer"
import { createContext, useContext } from "react"


const AdvTextContext = createContext<boolean>(false);

type AdvTextProps = {
	onWordPointed: (value: string) => void
} & TextProps & HighlightSlice

export function AdvText({ children, id, onWordPointed, highlights, setHighlights, ...props }: AdvTextProps) {
	const insideAdvText = useContext(AdvTextContext)

	let tokenIndex = 0
	const nextTokenIndex = () => tokenIndex++

	if (insideAdvText) {
		return <ChakraText {...props}>{children}</ChakraText>
	}

	return (
		<AdvTextContext.Provider value={true}>
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
		</AdvTextContext.Provider>
	)
}