import { Dispatch, SetStateAction } from "react";
import { createStore } from "zustand/vanilla";


export type ChatStore = {
	//activeChat: AiChatRead | null | undefined
	//setActiveChat: Dispatch<SetStateAction<AiChatRead | null | undefined>>

	activeChatId: string | null | undefined
	setActiveChatId: Dispatch<SetStateAction<string | null | undefined>>

	drafts: Record<string, string>
	setDraft: (chat_id: string, value: SetStateAction<string>) => void

	streamingMessages: Record<string, string>
	setStreamingMessage: (chat_id: string, value: SetStateAction<string>) => void
}


export function createChatStore(initialChatId?: string) {
	return createStore<ChatStore>((set) => ({
		//activeChat: null,
		//setActiveChat: (value) => set((s) => ({ activeChat: typeof value === "function" ? value(s.activeChat) : value })),

		activeChatId: initialChatId,
		setActiveChatId: (value) => set((s) => ({ activeChatId: typeof value === "function" ? value(s.activeChatId) : value })),

		drafts: { "default": "" },
		setDraft: (chat_id, value) =>
			set((s) => ({
				drafts: {
					...s.drafts,
					[chat_id]: typeof value === "function"
						? value(s.drafts[chat_id] ?? "")
						: value
				}
			})),

		streamingMessages: {},
		setStreamingMessage: (chat_id, value) =>
			set((s) => ({
				streamingMessages: {
					...s.streamingMessages,
					[chat_id]: typeof value === "function"
						? value(s.streamingMessages[chat_id] ?? "")
						: value
				}
			})),

	}))
}

