import { AiChatRead } from "@/client";
import { Dispatch, SetStateAction } from "react";
import { createStore } from "zustand/vanilla";


export type ChatStore = {
	chat: AiChatRead | null
	setChat: Dispatch<SetStateAction<AiChatRead | null>>

	drafts: Record<string, string>
	setDraft: (chat_id: string, value: string) => void
}


export function createChatStore() {
	return createStore<ChatStore>((set) => ({
		chat: null,
		setChat: (value) => set(({ chat }) => ({ chat: typeof value === "function" ? value(chat) : value })),

		drafts: {},
		setDraft: (chat_id, value) => set(({ drafts }) => ({ drafts: { ...drafts, [chat_id]: value } }))
	}))
}

