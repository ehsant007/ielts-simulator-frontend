"use client"

import { createContext, useContext, useState } from "react";
import { ModuleRead } from "@/client";

type ModuleContextType = {
	module: ModuleRead
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead
}

export function ModuleContextProvider({ children, module }: ModuleContextProviderProps) {
	return <ModuleContext.Provider value={{ module }}>
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
