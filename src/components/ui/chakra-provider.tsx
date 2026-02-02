"use client"

import { ChakraProvider as Provider } from "@chakra-ui/react"
import { system } from "@/components/theme"
import {
	ColorModeProvider,
	type ColorModeProviderProps,
} from "./color-mode"

import { LocaleProvider } from "@chakra-ui/react"
import { useLocale } from "next-intl"

import { Toaster } from '@/components/ui/toaster';

export default function ChakraProvider(props: ColorModeProviderProps) {
	const locale = useLocale()
	return (
		<LocaleProvider locale={locale}>
			<Provider value={system}>

				<ColorModeProvider defaultTheme="light"  {...props} />
				<Toaster />

			</Provider>
		</LocaleProvider>
	)
}
