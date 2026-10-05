import { AiMessageRead } from "@/client";
import { Dispatch, SetStateAction } from "react";
import { createStore } from "zustand/vanilla";


export type ChatStore = {
	//activeChat: AiChatRead | null | undefined
	//setActiveChat: Dispatch<SetStateAction<AiChatRead | null | undefined>>

	activeChatId: string | null | undefined
	setActiveChatId: Dispatch<SetStateAction<string | null | undefined>>

	drafts: Record<string, string>
	setDraft: (chat_id: string, value: SetStateAction<string>) => void


	streams: Record<string, { message: AiMessageRead, revision: number }>
	addStream: (message: AiMessageRead) => void
	removeStream: (chatId: string) => void
	invalidateStream: (chatId: string) => void
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

		streams: {},
		addStream: (message) => set((s) => ({
			streams: {
				...s.streams,
				[message.chat_id]: { message, revision: 0 },
			}
		})),
		removeStream: (chatId) =>
			set((s) => {
				const { [chatId]: _, ...stream } = s.streams
				return { streams: stream }
			}),
		invalidateStream: (chatId) =>
			set((s) => {
				const stream = s.streams[chatId]

				if (!stream)
					return s

				return {
					streams: {
						...s.streams,
						[chatId]: {
							...stream,
							revision: stream.revision + 1,
						},
					},
				}
			}),
	}))
}

