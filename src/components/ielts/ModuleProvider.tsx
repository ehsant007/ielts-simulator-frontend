"use client"

import { createContext, useContext, useMemo, useState } from "react";
import { AttemptRead, ModuleRead } from "@/client";
import { useStore } from "zustand";
import { createModuleStore, ModuleMode, ModuleStore, QuestionMeta } from "./store"

const ModuleContext = createContext<ReturnType<typeof createModuleStore> | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead,
	mode: ModuleMode,
	lastAttempt: AttemptRead | undefined,
}

export function ModuleContextProvider({ children, module, mode, lastAttempt }: ModuleContextProviderProps) {
	const questionsMeta = useMemo(() => {
		const map: Record<number, QuestionMeta> = {}
		module.questions.forEach((question, index) => {
			map[question.num] = {
				index,
				focused: question.num === 1,
				focusCount: 0,
			}
		})

		return map
	}, [module])


	const [store] = useState(() => createModuleStore(module, mode, questionsMeta, lastAttempt));

	return <ModuleContext.Provider value={store} >
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

export function useModuleStoreApi() {
	const store = useContext(ModuleContext)
	if (!store) throw new Error("useModuleStoreApi must be used within a ModuleContextProvider")
	return store
}
