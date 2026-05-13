"use client"

import { createContext, useContext, useMemo, useRef } from "react";
import { ModuleRead } from "@/client";
import { useStore } from "zustand";
import { createModuleStore, ModuleStore, QuestionMeta } from "./store"

const ModuleContext = createContext<ReturnType<typeof createModuleStore> | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead
}

export function ModuleContextProvider({ children, module }: ModuleContextProviderProps) {
	const store = useRef<ReturnType<typeof createModuleStore> | undefined>(undefined)

	const questionsMeta = useMemo(() => {
		const map: Record<number, QuestionMeta> = {}
		module.questions.forEach((question, index) => {
			map[question.num] = {
				index,
				focused: question.num == 0
			}
		})

		return map
	}, [module])

	if (!store.current) {
		store.current = createModuleStore(module, questionsMeta)
	}

	console.log("ModuleProvider")

	return <ModuleContext.Provider value={store.current} >
		{children}
	</ModuleContext.Provider>
}

export function useModuleStore<T>(selector: (state: ModuleStore) => T) {
	const store = useContext(ModuleContext)
	if (!store) {
		throw new Error("useAnswers must be used within a ModuleContextProvider");
	}

	return useStore(store, selector);
}
