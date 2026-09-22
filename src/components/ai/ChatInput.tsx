import { Box, HStack, IconButton, IconButtonProps, InputGroup, InputGroupProps, Separator, Textarea, VStack, Spinner, Icon, Center } from "@chakra-ui/react"
import { useRef, useState } from "react"
import { BsStopFill } from "react-icons/bs"
import { HiArrowUp } from "react-icons/hi"
import { LuAudioLines, LuCheck, LuLoader, LuMic, LuX } from "react-icons/lu"
import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from "react-icons/ri"
import { useChatStore } from "./ChatProvider"
import { cancelMessageCreate, messageCreateKey, messagesQueryKey, useActiveChat, useChatCreateMutation, useMessageCreateStreamMutation, useRecorder, useSelectChat } from "./hooks"
import { useIsMobile } from "@/providers/BreakPointProvider"
import { v7 as uuid7 } from "uuid"
import { InfiniteData, useMutation, useMutationState, useQueryClient } from "@tanstack/react-query"
import { AiMessagePage, AiMessageCreate, transcribeAudio } from "@/client"
import { AudioRecorderVisualizer } from "./RecorderVisualizer"


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

type InputMode = "text" | "voice"

export type ChatInputInnerProps = {
	value?: string
	onValueChange?: (value: string) => void
	onSend?: () => void
	onStop?: () => void
	onVoiceSubmit?: (audio: Blob) => Promise<void>
	onVoiceSubmitCancel?: () => void
	sending?: boolean
} & Omit<InputGroupProps, "children">

function ChatInputInner({ value, onValueChange, onSend, onStop, onVoiceSubmit, onVoiceSubmitCancel, sending, ...props }: ChatInputInnerProps) {
	const [mode, setMode] = useState<InputMode>("text")

	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const singleLineHeight = useRef(Number.MAX_VALUE)

	const [multiLines, setMultiLines] = useState(false)
	const [submittingVoice, setSubmittingVoice] = useState(false)

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

					{mode === "text" &&
						<HStack
							mt="auto"
							position="relative"
							gap="3"
							my="auto"
						>
							<InputButton
								onClick={() => {
									setMode("voice")
									if(value)
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
								:
								<InputButton variant="solid" colorPalette="primary" onClick={onSend}>
									<HiArrowUp />
								</InputButton>
							}
						</HStack>
					}

					{mode === "voice" &&
						<HStack
							mt="auto"
							position="relative"
							gap="3"
							my="auto"
						>
							<InputButton onClick={DiscardVoice}>
								<LuX />
							</InputButton>
							<InputButton onClick={submitVoice} waiting={submittingVoice}>
								<LuCheck />
							</InputButton>
						</HStack>
					}

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
} & ChatInputInnerProps

export function ChatInput({ onMessageCreate, ...props }: ChatInputProps) {
	const queryClient = useQueryClient()
	const activeChat = useActiveChat()
	const selectChat = useSelectChat()

	const chatId = activeChat?.id ?? "default"

	const userMsg = useChatStore(s => s.drafts[chatId])
	const setDraft = useChatStore(s => s.setDraft)
	const setUserMsg = (value: string) => setDraft(chatId, value)

	const setStreamingMessage = useChatStore((s) => s.setStreamingMessage)

	const createMessageMut = useMessageCreateStreamMutation({
		onMutate: () => {
			setUserMsg("")
			onMessageCreate?.()

			if (activeChat)
				setStreamingMessage(activeChat?.id, "")
		},

		onError: (createData) => {
			setUserMsg(createData.content)
		},

		onStream: (data, chat_id) => {
			setStreamingMessage(chat_id, prev => prev + data)
		},
	})

	const chatCreateMutation = useChatCreateMutation({
		onSuccess: (chat, createData) => {

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

			selectChat(chat)
			createMessageMut.mutate({
				id: uuid7(),
				content: createData.message,
				chat_id: chat.id
			}
			)
		},
	})

	const isMessageCreating = useMutationState({
		filters: {
			mutationKey: messageCreateKey,
			status: "pending",
		},
		select: mutation => (mutation.state.variables as AiMessageCreate).chat_id === activeChat?.id,
	}).some(Boolean)

	const pending = chatCreateMutation.isPending || isMessageCreating

	const handleSend = () => {
		if (!userMsg.trim() || pending)
			return

		if (activeChat == null)
			chatCreateMutation.mutate({
				id: uuid7(),
				message: userMsg,
				title: userMsg.slice(0, 20)
			})
		else
			createMessageMut.mutate({
				id: uuid7(),
				content: userMsg,
				chat_id: activeChat.id
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

	return (
		<ChatInputInner
			value={userMsg}
			onValueChange={(value) => setUserMsg(value)}
			onSend={handleSend}
			onStop={() => cancelMessageCreate(activeChat?.id)}
			sending={pending}
			onVoiceSubmit={async blob => {
				await transcriber.mutateAsync(blob)
			}}
			onVoiceSubmitCancel={() => transcriberController.current.abort("Voice submit canceled.")}
			{...props}
		/>
	)
}

