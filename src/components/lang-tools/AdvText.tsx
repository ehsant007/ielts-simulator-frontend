"use client"

import { Text as ChakraText, TextProps } from "@chakra-ui/react"
import { LangToolsSlice } from "./store"
import { Highlighter } from "./Highlighter"
import { tokenizer } from "./tokenizer"
import { createContext, forwardRef, useContext } from "react"
import { StoreApi } from "zustand"
import { LangToolsContext, useLangToolStore } from "./hooks"

const AdvTextContext = createContext<boolean>(false);


type AdvTextProps = {
	store: StoreApi<LangToolsSlice>
} & TextProps

export const AdvText = forwardRef<HTMLDivElement, AdvTextProps>(({
	children,
	store,
	...props
}, ref) => {
	const insideAdvText = useContext(AdvTextContext)

	if (insideAdvText) {
		return <ChakraText ref={ref} {...props}>{children}</ChakraText>
	}

	return (
		<AdvTextContext.Provider value={true}>
			<LangToolsContext.Provider value={store}>
				<AdvTextInner
					ref={ref}
					{...props}
				>
					{children}
				</AdvTextInner>
			</LangToolsContext.Provider>
		</AdvTextContext.Provider>
	)
})

AdvText.displayName = "AdvText"


const AdvTextInner = forwardRef<HTMLDivElement, TextProps>(({
	children,
	id,
	...props
}, ref) => {
	const setWordQuery = useLangToolStore((state) => state.setWordQuery)
	let tokenIndex = 0
	const nextTokenIndex = () => tokenIndex++

	return (
		<ChakraText data-advtext-id={id} ref={ref} {...props}>
			{id? (
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