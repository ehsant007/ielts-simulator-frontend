"use client"

import { TextProps } from "@chakra-ui/react"
import { useModuleStore } from "./ModuleProvider"
import { AdvText as MyAdvText } from "@/components/lang-tools/AdvText"
import { forwardRef } from "react"

export const AdvText = forwardRef<HTMLDivElement, TextProps>(({ children, ...props }, ref) => {
	const setWordQuery = useModuleStore((state) => state.setWordQuery)
	const highlights = useModuleStore((state) => state.highlights)
	const setHighlights = useModuleStore((state) => state.setHighlights)

	return (
		<MyAdvText
			ref={ref}
			{...props}
			onWordPointed={setWordQuery}
			highlights={highlights}
			setHighlights={setHighlights}
		>
			{children}
		</MyAdvText>
	)
})

AdvText.displayName = "AdvText"
