"use client"

import { TextProps } from "@chakra-ui/react"
import { useModuleStoreApi } from "./ModuleProvider"
import { AdvText as MyAdvText } from "@/components/lang-tools/AdvText"
import { forwardRef } from "react"

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
