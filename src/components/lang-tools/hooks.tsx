"use client"

import { createContext, useContext } from "react";
import { StoreApi, useStore } from "zustand";
import { LangToolsSlice } from "./store";

export const LangToolsContext = createContext<StoreApi<LangToolsSlice> | undefined>(undefined)

export function useLangToolStore<T>(selector: (state: LangToolsSlice) => T) {
	const store = useContext(LangToolsContext)
	if (!store) {
		throw new Error("useLangToolStore must be used within a LangToolsContext");
	}

	return useStore(store, selector);
}
