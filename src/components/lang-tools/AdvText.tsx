"use client"

import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { Highlighter } from "./Highlighter"
import { tokenizer } from "./tokenizer"
import { createContext, forwardRef, useContext } from "react"
import { useLangToolsStore } from "./LangToolsProvider"

const AdvTextContext = createContext<boolean>(false);


export const AdvText = forwardRef<HTMLDivElement, TextProps>(({ children, ...props }, ref) => {
	const insideAdvText = useContext(AdvTextContext)

	if (insideAdvText) {
		return <ChakraText ref={ref} {...props}>{children}</ChakraText>
	}

	return (
		<AdvTextContext.Provider value={true}>

			<AdvTextInner ref={ref} {...props}>
				{children}
			</AdvTextInner>

		</AdvTextContext.Provider>
	)
})

AdvText.displayName = "AdvText"


const AdvTextInner = forwardRef<HTMLDivElement, TextProps>(({
	children,
	id,
	...props
}, ref) => {
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	let tokenIndex = 0
	const nextTokenIndex = () => tokenIndex++

	return (
		<ChakraText data-advtext-id={id} ref={ref} {...props}>
			{id ? (
				<Highlighter id={id}>
					{tokenizer(children, nextTokenIndex, setWordQuery)}
				</Highlighter>
			) : (
				tokenizer(children, nextTokenIndex, setWordQuery)
			)}
		</ChakraText>
	)
})

AdvTextInner.displayName = "AdvTextInner"