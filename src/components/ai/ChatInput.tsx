import { Box, HStack, IconButton, IconButtonProps, InputGroupProps, Textarea, Spinner, Icon, Center, BoxProps, TextareaProps, mergeRefs } from "@chakra-ui/react"
import { forwardRef, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react"
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


type Textarea2Props = {
	onLineModeChange?: (multiLine: boolean) => void
} & TextareaProps

export const Textarea2 = forwardRef<HTMLTextAreaElement, Textarea2Props>(({ onLineModeChange, value, ...props }, ref) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const auxRef = useRef<HTMLTextAreaElement>(null)
	const multiLineRef = useRef<boolean | null>(null)

	const handleChange = useEffectEvent(() => {
		let multiLine = false
		if (value !== "" && value != null) {
			const textarea = textareaRef.current
			const aux = auxRef.current
			if (textarea && aux)
				multiLine = textarea.scrollHeight > aux.scrollHeight
		}

		if (multiLineRef.current !== multiLine) {
			multiLineRef.current = multiLine
			onLineModeChange?.(multiLine)
		}
	})

	useLayoutEffect(() => {
		handleChange()
	}, [value])

	useEffect(() => {
		const textarea = textareaRef.current
		if (!textarea)
			return

		const observer = new ResizeObserver(() => {
			handleChange()
		})

		observer.observe(textarea)

		return () => observer.disconnect()
	}, [])

	return (
		<Box position="relative" w="full" h="fit-content">
			<Textarea position="absolute" w="1" top="0" left="50%" disabled  ref={auxRef} border="none" resize="none"/>
			<Textarea ref={mergeRefs(textareaRef, ref)} value={value} {...props} />
		</Box>
	)
})
Textarea2.displayName = "Textarea2"

type InputMode = "text" | "voice" | "call"

export type ChatInputInnerProps = {
	mode: InputMode
	setMode: (mode: InputMode) => void
	value: string
	setValue: (value: string) => void
	onSend?: () => void
	onStop?: () => void
	onCall?: () => void
	onEndCall?: () => void
	onVoiceSubmit?: (audio: Blob) => Promise<void>
	onVoiceSubmitCancel?: () => void
	sending?: boolean
} & Omit<BoxProps, "children">

function ChatInputInner({
	mode,
	setMode,
	value,
	setValue,
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

	const [submittingVoice, setSubmittingVoice] = useState(false)


	const [fullExpand, setFullExpand] = useState(false)
	const [multiLine, setMultiLine] = useState(false)
	const { isMobile } = useIsMobile()
	const expand = isMobile || multiLine || fullExpand || (mode === "voice" && value)

	useLayoutEffect(() => {
		textareaRef.current?.focus()
	}, [mode, fullExpand])

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

	return (
		<Box
			w="full"
			position="relative"
			{...props}
		>
			<Textarea2
				ref={textareaRef}
				onLineModeChange={(multiline) => setMultiLine(multiline)}
				display="block"
				placeholder="Ask anything"
				borderRadius="4xl"
				bg="bg.muted"
				focusRing="none"
				border="none"
				shadow="sm"
				rows={fullExpand ? 20 : 1}
				ps="5"
				pt={expand ? "8" : "4"}
				pb={expand ? "4rem" : "4"}
				pe={expand ? "3.5rem" : "6rem"}
				size="lg"
				autoresize
				maxH="60dvh"
				autoFocus
				value={value}

				transition="padding 0.2s ease-in-out"

				onChange={(e) => setValue(e.currentTarget.value)}

				onKeyDown={(e) => {
					if (e.key !== "Enter" || e.shiftKey || fullExpand)
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
					h={expand ? "3.5rem" : "full"}
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


			{expand &&
				<Box
					position="absolute"
					top="0"
					right="0"
					zIndex="3"
					p="2"
				>
					<InputButton color="fg.muted" onClick={() => setFullExpand(prev => !prev)}>
						{fullExpand ? <RiCollapseDiagonalLine /> : <RiExpandDiagonalLine />}
					</InputButton>
				</Box>
			}


			<HStack
				position="absolute"
				bottom="0"
				right="0"
				gap="3"
				p="2"
				h={expand ? "3.5rem" : "full"}
			>
				{mode === "text" &&
					<>
						<InputButton
							onClick={() => {
								setMode("voice")
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

		</Box>
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
			setValue={setValue}
			onSend={() => {
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

