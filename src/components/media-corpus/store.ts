import { createStore } from "zustand/vanilla";
import {CorpusSegmentRead} from "@/client"

export type CorpusStore = {
	subtitle: Map<number, Map<number, CorpusSegmentRead>>
	
}


export function createChatStore(initialChatId?: string) {
	return createStore<CorpusStore>((set) => ({
		
	}))
}

