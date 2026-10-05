"use client"

import { InfiniteData, useMutationState, useQueryClient } from "@tanstack/react-query";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { useChatStore } from "./ChatProvider";
import { cancelMessageCreate, messageCreateKey, messagesQueryKey, useChatCreateMutation, useChatLiveAssistant, useMessageCreateStreamMutation, useSelectChat, useTranscriber } from "./hooks";
import { AiMessageCreate, AiMessagePage } from "@/client";
import { v7 as uuid7 } from "uuid"

export type InputMode = "text" | "voice" | "call"

type ChatInputContextType = {
	mode: InputMode
	setMode: Dispatch<SetStateAction<InputMode>>

	value: string
	setValue: Dispatch<SetStateAction<string>>

	createMessageMutation: ReturnType<typeof useMessageCreateStreamMutation>

	createChatMutation: ReturnType<typeof useChatCreateMutation>

	transcriber: ReturnType<typeof useTranscriber>

	liveAssistant: ReturnType<typeof useChatLiveAssistant>

	send: () => void
	cancelSend: () => void
	isSending: boolean

	call: () => void
	endCall: () => void
}

const ChatInputContext = createContext<ChatInputContextType | undefined>(undefined)

type ChatInputProviderProps = {
	children: React.ReactNode
}

export function ChatInputProvider({ children }: ChatInputProviderProps) {
	const [mode, setMode] = useState<InputMode>("text")

	const queryClient = useQueryClient()
	const activeChatId = useChatStore(s => s.activeChatId)
	const selectChat = useSelectChat()

	const chatId = activeChatId ?? "default"

	const value = useChatStore(s => s.drafts[chatId] ?? "")
	const setDraft = useChatStore(s => s.setDraft)
	const setValue = (set: SetStateAction<string>) => setDraft(chatId, set)

	const createMessageMutation = useMessageCreateStreamMutation({
		onMutate: () => {
			setValue("")
		},

		onError: (createData) => {
			setValue(createData.content)
		},
	})

	const createChatMutation = useChatCreateMutation({
		onSuccess: (chat, _createData) => {

			// Initialize the messages query cache when a new chat is created
			queryClient.setQueryData<InfiniteData<AiMessagePage>>(
				messagesQueryKey(chat.id),
				{
					pages: [
						{
							messages: [],
							previous_cursor: null,
							next_cursor: null,
						},
					],
					pageParams: [{}],
				}
			)

			selectChat(chat.id)
		},
	})

	const isMessageCreating = useMutationState({
		filters: {
			mutationKey: messageCreateKey,
			status: "pending",
		},
		select: mutation => (mutation.state.variables as AiMessageCreate).chat_id === activeChatId,
	}).some(Boolean)

	const isSending = createChatMutation.isPending || isMessageCreating

	const transcriber = useTranscriber({
		onTranscribe: (text) => {
			setDraft(chatId, prev => (prev ? prev + "\n\n" : "") + text)
		},
	})


	const liveAssistant = useChatLiveAssistant({
		onSessionStop: () => {
			setMode("text")
		}
	})

	const send = useCallback(async () => {
		if (!value || !value.trim() || isSending)
			return

		const msg = value
		let chat_id = activeChatId

		if (chat_id == null) {
			const { data: chat, response } = await createChatMutation.mutateAsync({
				id: uuid7(),
				message: msg,
				title: value.slice(0, 20)
			})

			if (!response.ok)
				return

			chat_id = chat.id
		}

		createMessageMutation.mutate({
			id: uuid7(),
			content: msg,
			chat_id: chat_id
		})
	}, [value, isSending, createChatMutation, createMessageMutation, activeChatId])

	const cancelSend = useCallback(() => {
		cancelMessageCreate(activeChatId)
	}, [activeChatId])

	const call = useCallback(async () => {
		let chat_id = activeChatId

		if (chat_id == null) {
			const { data: chat, response } = await createChatMutation.mutateAsync({
				id: uuid7(),
				message: value,
				title: "New live conversation"
			})

			if (!response.ok)
				return

			chat_id = chat.id
		}

		liveAssistant.startSession(`ws://localhost:8000/api/v1/ai/tutor/${chat_id}`)
	}, [value, createChatMutation, activeChatId, liveAssistant])

	const endCall = useCallback(async () => {
		liveAssistant.stopSession()
	}, [liveAssistant])

	return (
		<ChatInputContext.Provider value={{
			mode,
			setMode,
			value,
			setValue,
			createMessageMutation,
			createChatMutation,
			transcriber,
			liveAssistant,
			send,
			cancelSend,
			isSending,
			call,
			endCall,
		}}
		>
			{children}
		</ChatInputContext.Provider>
	)
}

export function useChatInput() {
	const context = useContext(ChatInputContext)
	if (!context)
		throw new Error("useChatInput must be used within ChatInputProvider")
	return context
}
