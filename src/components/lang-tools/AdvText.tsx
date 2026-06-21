"use client"

import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { Highlighter } from "./Highlighter"
import { tokenize } from "./tokenizer"
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

	const content = tokenize(children, (token, index, isWord) => {
		return (
			<span
				key={`token-${index}`}
				data-token-index={index}
				{...(isWord ?
					{
						"data-word": token,
						onPointerEnter: () => setWordQuery(token),
					}
					: {}
				)
				}
			>
				{token}
			</span>
		)
	})

	return (
		<ChakraText data-advtext-id={id} ref={ref} {...props}>
			{id ? <Highlighter id={id}>{content}</Highlighter> : content}
		</ChakraText>
	)
})

AdvTextInner.displayName = "AdvTextInner"