"use client"

import type { DictionaryEntry } from "@/client";
import { createContext, useContext } from "react";

type DictionaryEntryContextType = {
	entry: DictionaryEntry,
}

const DictionaryEntryContext = createContext<DictionaryEntryContextType | undefined>(undefined)

type DictionaryEntryProviderProps = {
	children: React.ReactNode,
	entry: DictionaryEntry,
}

export function DictionaryEntryProvider({ children, entry }: DictionaryEntryProviderProps) {
	return <DictionaryEntryContext.Provider value={{ entry: entry }} >
		{children}
	</DictionaryEntryContext.Provider>
}


export function useDictionaryEntry() {
	const context = useContext(DictionaryEntryContext)
	if (!context) throw new Error("useDictionaryEntry must be used within a DictionaryEntryProvider")
	return context.entry
}
