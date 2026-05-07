"use client"

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { ModuleRead } from "@/client";

type ModuleContextType = {
	module: ModuleRead
	section: number
	setSection: Dispatch<SetStateAction<number>>
	focus: string | undefined
	setFocus: Dispatch<SetStateAction<string>>
	focusTick: number
	setFocusTick: Dispatch<SetStateAction<number>>
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead
}

export function ModuleContextProvider({ children, module }: ModuleContextProviderProps) {
	const [section, setSection] = useState<number>(0)
	const [focus, setFocus] = useState<string>("")
	const [focusTick, setFocusTick] = useState<number>(0)

	return <ModuleContext.Provider value={{ module, section, focus, focusTick, setSection, setFocus, setFocusTick}}>
		{children}
	</ModuleContext.Provider>
}

export function useModule() {
	const context = useContext(ModuleContext)
	if (!context) {
		throw new Error("useModule must be used within a ModuleContextProvider");
	}

	return context;
}
