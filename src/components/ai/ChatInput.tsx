import { Box, HStack, IconButton, IconButtonProps, InputGroup, InputGroupProps, Separator, Textarea, VStack, Spinner, Icon, Center } from "@chakra-ui/react"
import { useLayoutEffect, useRef, useState } from "react"
import { BsStopFill } from "react-icons/bs"
import { HiArrowUp } from "react-icons/hi"
import { LuAudioLines, LuCheck, LuLoader, LuMic, LuX } from "react-icons/lu"
import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from "react-icons/ri"
import { useRecorder } from "./hooks"
import { useIsMobile } from "@/providers/BreakPointProvider"
import { AudioRecorderVisualizer } from "./RecorderVisualizer"
import { useChatInput } from "./ChatInputProvider"


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
	onSend?: () => void
} & Omit<InputGroupProps, "children">

export function ChatInput({ onSend, ...props }: ChatInputProps) {
	const {
		mode,
		setMode,
		value,
		setValue,
		send,
		cancelSend,
		isSending,
		call,
		endCall,
		transcriber,
	} = useChatInput()

	return (
		<ChatInputInner
			mode={mode}
			setMode={setMode}
			value={value}
			onValueChange={setValue}
			onSend={()=>{
				send()
				onSend?.()
			}}
			onStop={cancelSend}
			sending={isSending}

			onVoiceSubmit={async blob => {
				await transcriber.mutateAsync(blob)
			}}
			onVoiceSubmitCancel={transcriber.cancel}

			onCall={call}
			onEndCall={endCall}

			{...props}
		/>
	)
}

