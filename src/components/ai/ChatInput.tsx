import { HStack, IconButton, IconButtonProps, InputGroup, InputGroupProps, Separator, Textarea, VStack } from "@chakra-ui/react"
import { useRef, useState } from "react"
import { BsStopFill } from "react-icons/bs"
import { HiArrowUp } from "react-icons/hi"
import { LuMic } from "react-icons/lu"
import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from "react-icons/ri"
import { useChatStore } from "./ChatProvider"
import { useChatCreateMutation, useMessageCreateMutation } from "./hooks"
import { useIsMobile } from "@/providers/BreakPointProvider"
import { v7 as uuid7 } from "uuid"

function InputButton({ children, ...props }: IconButtonProps) {
	return (
		<IconButton
			minW="unset"
			h="auto"
			p="2"
			variant="ghost"
			borderRadius="full"
			{...props}
		>
			{children}
		</IconButton>
	)
}

export type ChatInputProps = {
	value?: string
	onValueChange?: (value: string) => void
	onSend?: () => void
	onStop?: () => void
	pending?: boolean
} & Omit<InputGroupProps, "children">

function ChatInputInner({ value, onValueChange, onSend, onStop, pending, ...props }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const singleLineHeight = useRef(Number.MAX_VALUE)

	const [multiLines, setMultiLines] = useState(false)

	//const isMobile = useBreakpointValue({ base: true, md: false, })
	const { isMobile } = useIsMobile()
	const [expand2, setExpand2] = useState(false)

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
						<InputButton>
							<LuMic />
						</InputButton>
						{pending
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
				</VStack>
			}
			{...props}
		>
			<Textarea
				ref={textareaRef}
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
				pe={expand1 ? "5" : "6rem"}
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
		</InputGroup>
	)
}


export function ChatInput({ ...props }: ChatInputProps) {
	const activeChat = useChatStore((s) => s.activeChat)
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const chatId = activeChat?.id ?? "default"

	const userMsg = useChatStore(s => s.drafts[chatId])
	const setDraft = useChatStore(s => s.setDraft)
	const setUserMsg = (value: string) => setDraft(chatId, value)

	const createMessageMut = useMessageCreateMutation({
		onMutate: () => {
			setUserMsg("")
		},

		onError: (message) => {
			setUserMsg(message)
		},
	})

	const chatCreateMutation = useChatCreateMutation({
		onSuccess: (chat) => {
			setActiveChat(chat)
			createMessageMut.mutate({ id: uuid7(), content: userMsg, chat_id: chat.id })
		},
	})

	const handleSend = () => {
		if (!userMsg.trim() || chatCreateMutation.isPending)
			return

		if (activeChat == null)
			chatCreateMutation.mutate({ id: uuid7(), message: userMsg, title: userMsg.slice(0, 20) })
		else
			createMessageMut.mutate({ id: uuid7(), content: userMsg, chat_id: activeChat.id })
	}

	return (
		<ChatInputInner
			value={userMsg}
			onValueChange={(value) => setUserMsg(value)}
			onSend={handleSend}
			onStop={() => { }}
			pending={chatCreateMutation.isPending}
			{...props}
		/>
	)
}

