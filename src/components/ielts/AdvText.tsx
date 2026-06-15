"use client"

import { TextProps } from "@chakra-ui/react"
import { useModuleStore } from "./ModuleProvider"
import { AdvText as MyAdvText } from "@/components/lang-tools/AdvText"

export function AdvText({ children, ...props }: TextProps) {
	const setWordQuery = useModuleStore((state) => state.setWordQuery)
	const highlights = useModuleStore((state) => state.highlights)
	const setHighlights = useModuleStore((state) => state.setHighlights)

	return (
		<MyAdvText
			{...props}
			onWordPointed={setWordQuery}
			highlights={highlights}
			setHighlights={setHighlights}
		>
			{children}
		</MyAdvText>
	)
}
