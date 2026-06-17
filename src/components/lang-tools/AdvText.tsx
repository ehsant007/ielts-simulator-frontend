"use client"

import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { HighlightSlice } from "./types"
import { Highlighter } from "./Highlighter"
import { tokenizer } from "./tokenizer"
import { createContext, forwardRef, useContext } from "react"


const AdvTextContext = createContext<boolean>(false);

type AdvTextProps = {
	onWordPointed: (value: string) => void
} & TextProps & HighlightSlice

export const AdvText = forwardRef<HTMLDivElement, AdvTextProps>(({ children, id, onWordPointed, highlights, setHighlights, ...props }, ref) => {
	const insideAdvText = useContext(AdvTextContext)

	let tokenIndex = 0
	const nextTokenIndex = () => tokenIndex++

	if (insideAdvText) {
		return <ChakraText ref={ref} {...props}>{children}</ChakraText>
	}

	return (
		<AdvTextContext.Provider value={true}>
			<ChakraText ref={ref} {...props}>
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
})

AdvText.displayName = "AdvText"