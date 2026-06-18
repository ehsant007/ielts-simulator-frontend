"use client"

import { Button, ButtonProps, TextProps } from "@chakra-ui/react"
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider"
import { AdvText as MyAdvText } from "@/components/lang-tools/AdvText"
import { forwardRef } from "react"
import { highlightSelectedText } from "../lang-tools/Highlighter"

export const AdvText = forwardRef<HTMLDivElement, TextProps>(({ children, ...props }, ref) => {

	const store = useModuleStoreApi()

	return (
		<MyAdvText
			ref={ref}
			store={store}
			{...props}
		>
			{children}
		</MyAdvText>
	)
})

AdvText.displayName = "AdvText"



export const HighlightButton = forwardRef<HTMLButtonElement, ButtonProps>(({ children, onClick, ...props }, ref) => {
	const setHighlights = useModuleStore((s) => s.setHighlights)

	return (
		<Button
			onClick={(e) => {
				highlightSelectedText({ setHighlights })
				onClick?.(e)
			}}
			ref={ref}
			{...props}
		>
			{children}
		</Button>
	)
})
HighlightButton.displayName = "HighlightButton"
