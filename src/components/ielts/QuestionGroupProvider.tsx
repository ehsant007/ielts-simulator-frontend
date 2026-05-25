"use client"

import type { QuestionGroup } from "@/client";
import { createContext, useContext } from "react";

type QuestionContextType = {
	group: QuestionGroup,
}

const ModuleContext = createContext<QuestionContextType | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	group: QuestionGroup,
}

export function QuestionGroupProvider({ children, group }: ModuleContextProviderProps) {
	return <ModuleContext.Provider value={{ group }} >
		{children}
	</ModuleContext.Provider>
}


export function useQuestionGroup() {
	const context = useContext(ModuleContext)
	if (!context) throw new Error("useQuestion must be used within a QuestionProvider")
	return context
}
