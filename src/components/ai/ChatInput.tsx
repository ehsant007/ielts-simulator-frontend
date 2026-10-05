import { Box, HStack, IconButton, IconButtonProps, InputGroup, InputGroupProps, Separator, Textarea, VStack, Spinner, Icon, Center } from "@chakra-ui/react"
import { useLayoutEffect, useRef, useState } from "react"
import { BsStopFill } from "react-icons/bs"
import { HiArrowUp } from "react-icons/hi"
import { LuAudioLines, LuCheck, LuLoader, LuMic, LuX } from "react-icons/lu"
import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from "react-icons/ri"
import { useChatStore, useChatStoreApi } from "./ChatProvider"
import { cancelMessageCreate, messageCreateKey, messagesQueryKey, useAddMessage, useChatCreateMutation, useMessageCreateStreamMutation, useRecorder, useSelectChat } from "./hooks"
import { useIsMobile } from "@/providers/BreakPointProvider"
import { v7 as uuid7 } from "uuid"
import { InfiniteData, useMutation, useMutationState, useQueryClient } from "@tanstack/react-query"
import { AiMessagePage, AiMessageCreate, transcribeAudio } from "@/client"
import { AudioRecorderVisualizer } from "./RecorderVisualizer"
import { useGoogleLiveAssistant } from "./live_asistant/hooks"


function InputButton({ children, waiting, ...props }: { waiting?: boolean } & IconButtonProps) {
	return (
		<IconButton
			minW="unset"
			h="auto"
			p="2"
			variant="subtle"
			borderRadius="full"
			{...props}
		>
			{waiting
				? <Spinner asChild borderWidth="0">
					<LuLoader />
				</Spinner>
				: children
			}
		</IconButton>
	)
}

type InputMode = "text" | "voice" | "call"

export type ChatInputInnerProps = {
	mode: InputMode
	setMode: (mode: InputMode) => void
	value?: string
	onValueChange?: (value: string) => void
	onSend?: () => void
	onStop?: () => void
	onCall?: () => void
	onEndCall?: () => void
	onVoiceSubmit?: (audio: Blob) => Promise<void>
	onVoiceSubmitCancel?: () => void
	sending?: boolean
} & Omit<InputGroupProps, "children">

function ChatInputInner({
	mode,
	setMode,
	value,
	onValueChange,
	onSend,
	onStop,
	onVoiceSubmit,
	onVoiceSubmitCancel,
	onCall,
	onEndCall,
	sending,
	...props
}: ChatInputInnerProps) {

	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const singleLineHeight = useRef(Number.MAX_VALUE)

	const [multiLines, setMultiLines] = useState(false)
	const [submittingVoice, setSubmittingVoice] = useState(false)

	useLayoutEffect(() => {
		if (mode === "voice")
			textareaRef.current?.focus()
	}, [mode])

	//const isMobile = useBreakpointValue({ base: true, md: false, })
	const { isMobile } = useIsMobile()
	const [expand2, setExpand2] = useState(false)

	const recorder = useRecorder()

	const submitVoice = async () => {
		if (submittingVoice) {
			onVoiceSubmitCancel?.()
			return
		}

		setSubmittingVoice(true)
		await recorder.stop()
		const blob = recorder.getRecording()
		if (blob == null) {
			setSubmittingVoice(false)
			return
		}

		try {
			await onVoiceSubmit?.(blob)
			setMode("text")
		} catch { }

		setSubmittingVoice(false)
	}

	const DiscardVoice = async () => {
		setMode("text")
		recorder.stop()
		if (submittingVoice)
			onVoiceSubmitCancel?.()
	}

	const handleCall = () => {
		setMode("call")
		onCall?.()
	}

	const handleEndCall = () => {
		setMode("text")
		onEndCall?.()
	}

	const expand1 = isMobile || multiLines || expand2

	return (
		<InputGroup
			endElement={
				<VStack
					h="full"
					gap="auto"
					py="2"
				>
					{expand1 &&
						<>
							<InputButton ms="auto" color="fg.muted" onClick={() => setExpand2(prev => !prev)}>
								{expand2 ? <RiCollapseDiagonalLine /> : <RiExpandDiagonalLine />}
							</InputButton>
							<Separator flex="1" />
						</>
					}

					<HStack
						mt="auto"
						position="relative"
						gap="3"
						my="auto"
					>
						{mode === "text" &&
							<>
								<InputButton
									onClick={() => {
										setMode("voice")
										if (value)
											setMultiLines(true)
										recorder.start()
									}}
								>
									<LuMic />
								</InputButton>
								{sending
									?
									<InputButton variant="solid" colorPalette="primary" onClick={onStop}>
										<BsStopFill />
									</InputButton>
									: value
										? <InputButton variant="solid" colorPalette="primary" onClick={onSend}>
											<HiArrowUp />
										</InputButton>
										: <InputButton variant="solid" colorPalette="primary" onClick={handleCall}>
											<LuAudioLines />
										</InputButton>
								}
							</>

						}

						{mode === "voice" &&
							<>
								<InputButton onClick={DiscardVoice}>
									<LuX />
								</InputButton>
								<InputButton onClick={submitVoice} waiting={submittingVoice}>
									<LuCheck />
								</InputButton>
							</>
						}

						{mode === "call" &&
							<InputButton variant="solid" colorPalette="primary" onClick={handleEndCall}>
								<BsStopFill />
							</InputButton>
						}

					</HStack>

				</VStack>
			}
			{...props}
		>
			<Box
				w="full"
				position="relative"
			>
				<Textarea
					ref={textareaRef}
					display="block"
					placeholder="Ask anything"
					borderRadius="4xl"
					bg="bg.muted"
					focusRing="none"
					border="none"
					shadow="sm"
					rows={expand2 ? 20 : 1}
					ps="5"
					pt={expand1 ? "8" : "4"}
					pb={expand1 ? "4rem" : "4"}
					pe={expand1 ? "3.5rem" : "6rem"}
					size="lg"
					autoresize
					maxH="60dvh"
					autoFocus
					value={value}

					transition="padding 0.2s ease-in-out"

					onChange={(e) => {
						const text = e.currentTarget.value
						singleLineHeight.current = Math.min(singleLineHeight.current, e.currentTarget.scrollHeight)
						if (text === "")
							setMultiLines(false)
						else if (text.includes("\n"))
							setMultiLines(true)
						else
							setMultiLines(e.currentTarget.scrollHeight > singleLineHeight.current)
						onValueChange?.(text)
					}}

					onKeyDown={(e) => {
						if (e.key !== "Enter" || e.shiftKey || expand2)
							return

						e.preventDefault()
						if (mode === "voice")
							submitVoice()
						else
							onSend?.()
					}}

					css={{
						"&::-webkit-scrollbar": {
							width: "0.4rem",
						},
						"&::-webkit-scrollbar-thumb": {
							bg: "fg.subtle",
							borderRadius: "full",
						},
						"&::-webkit-scrollbar-track": {
							bg: "transparent",
						},
					}}
				/>

				{mode === "voice" &&
					<Box
						position="absolute"
						bottom="0"
						left="0"
						w="full"
						h={expand1 ? "3.5rem" : "full"}
						pe="7rem"
						ps="5"
						pointerEvents="none"
					>
						{recorder.isRecording
							? <AudioRecorderVisualizer recorder={recorder.getRecorder()} />
							: <Center
								animation="primaryColorBreath 2s ease-in-out infinite"
								h="full"
							>
								<Icon size="xl"><LuAudioLines /></Icon>
								<Icon size="xl"><LuAudioLines /></Icon>
								<Icon size="xl"><LuAudioLines /></Icon>
							</Center>
						}
					</Box>
				}

			</Box>
		</InputGroup>
	)
}

type ChatInputProps = {
	onMessageCreate?: () => void
} & Omit<InputGroupProps, "children">

export function ChatInput({ onMessageCreate, ...props }: ChatInputProps) {
	const [mode, setMode] = useState<InputMode>("text")

	const queryClient = useQueryClient()
	const activeChatId = useChatStore(s => s.activeChatId)
	const selectChat = useSelectChat()

	const chatId = activeChatId ?? "default"

	const userMsg = useChatStore(s => s.drafts[chatId])
	const setDraft = useChatStore(s => s.setDraft)
	const setUserMsg = (value: string) => setDraft(chatId, value)

	const addStream = useChatStore((s) => s.addStream)
	const removeStream = useChatStore((s) => s.removeStream)
	const invalidateStream = useChatStore((s) => s.invalidateStream)
	const store = useChatStoreApi()

	const createMessageMut = useMessageCreateStreamMutation({
		onMutate: () => {
			setUserMsg("")
			onMessageCreate?.()
		},

		onError: (createData) => {
			setUserMsg(createData.content)
		},
	})

	const chatCreateMutation = useChatCreateMutation({
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

	const pending = chatCreateMutation.isPending || isMessageCreating

	const handleSend = async () => {
		if (!userMsg || !userMsg.trim() || pending)
			return

		const msg = userMsg
		let chat_id = activeChatId

		if (chat_id == null) {
			const { data: chat, response } = await chatCreateMutation.mutateAsync({
				id: uuid7(),
				message: msg,
				title: userMsg.slice(0, 20)
			})

			if (!response.ok)
				return

			chat_id = chat.id
		}

		createMessageMut.mutate({
			id: uuid7(),
			content: msg,
			chat_id: chat_id
		})
	}

	const transcriberController = useRef<AbortController>(new AbortController())

	const transcriber = useMutation({
		mutationKey: ["transcriber"],

		mutationFn: async (audio: Blob) => {
			transcriberController.current = new AbortController()
			const res = await transcribeAudio({
				body: {
					audio: audio,
				},
				signal: transcriberController.current.signal,
			})

			return res.data
		},

		onSuccess: (data) => {
			if (data == null)
				return
			setDraft(chatId, prev => (prev ? prev + "\n\n" : "") + data.message)
		},
	})

	const addMessage = useAddMessage()

	const liveAssistant = useGoogleLiveAssistant({
		onUserTranscript: ({ id, content }) => {
			if (!chatId)
				return

			addMessage({
				id,
				chat_id: chatId,
				content,
				role: "user",
				created_at: new Date().toISOString(),
			})
		},

		onAssistantTranscript: ({ id, content, partial }) => {
			let message = store.getState().streams[chatId]?.message
			if (message == null) {
				message = {
					id,
					chat_id: chatId,
					content,
					role: "assistant",
					created_at: new Date().toISOString(),
				}
				addMessage(message)
				addStream(message)
				return
			}

			if (partial) {
				message.content += content
				invalidateStream(message.chat_id)
			} else {
				message.content = content
				removeStream(message.chat_id)
			}
		},

		onSessionStop: () => {
			setMode("text")
		}
	})


	const handleCall = async () => {
		let chat_id = activeChatId

		if (chat_id == null) {
			const { data: chat, response } = await chatCreateMutation.mutateAsync({
				id: uuid7(),
				message: userMsg,
				title: "New live conversation"
			})

			if (!response.ok)
				return

			chat_id = chat.id
		}

		liveAssistant.startSession(`ws://localhost:8000/api/v1/ai/tutor/${chat_id}`)
	}

	return (
		<ChatInputInner
			mode={mode}
			setMode={(mode) => setMode(mode)}
			value={userMsg}
			onValueChange={(value) => setUserMsg(value)}
			onSend={handleSend}
			onStop={() => cancelMessageCreate(activeChatId)}
			sending={pending}
			onVoiceSubmit={async blob => {
				await transcriber.mutateAsync(blob)
			}}
			onVoiceSubmitCancel={() => transcriberController.current.abort("Voice submit canceled.")}

			onCall={handleCall}
			onEndCall={liveAssistant.stopSession}

			{...props}
		/>
	)
}

