import { AiChatRead } from "@/client";
import { Dispatch, SetStateAction } from "react";
import { createStore } from "zustand/vanilla";


export type ChatStore = {
	activeChat: AiChatRead | null
	setActiveChat: Dispatch<SetStateAction<AiChatRead | null>>

	drafts: Record<string, string>
	setDraft: (chat_id: string, value: string) => void
}


export function createChatStore() {
	return createStore<ChatStore>((set) => ({
		activeChat: null,
		setActiveChat: (value) => set((s) => ({ activeChat: typeof value === "function" ? value(s.activeChat) : value })),

		drafts: { "default": "" },
		setDraft: (chat_id, value) => set((s) => ({ drafts: { ...s.drafts, [chat_id]: value } })),
	}))
}

