"use client"

import { AiMessageRead, readChatMessages, readChats } from "@/client";
import { VStack, Text, Button, HStack, Box, ScrollArea, ScrollAreaRootProps, Collapsible, CollapsibleRootProps, InputGroup, IconButton, Textarea } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChatProvider, useChat } from "./ChatProvider";
import { LuCheck, LuChevronRight, LuCopy, LuMic } from "react-icons/lu";

import type { ButtonProps, IconButtonProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5";
import { BiUpArrowAlt } from "react-icons/bi";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { useFormatter } from "next-intl";


export function ChatPanel() {

	return (
		<ChatProvider>
			<HStack
				h="100%"
			>
				<ChatList p="3" />
				<ChatBox maxW="3xl" p="5" />
			</HStack>
		</ChatProvider>
	)
}


export function ListButton({ children, ...props }: ButtonProps) {
	return (
		<Button
			variant="ghost"
			w="full"
			color="fg"
			size="sm"
			fontWeight="normal"
			justifyContent="start"
			borderRadius="xl"
			{...props}
		>
			{children}
		</Button>
	)
}

export function ChatList({ ...props }: StackProps) {
	const { setChat } = useChat()

	const { data: chats } = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: ["chats"],
	})

	return (
		<Scroller w="18rem" variant="always" borderEnd="sm" borderColor="border">

			<VStack alignItems="start" {...props}>

				<VStack w="full">
					<ListButton><IoCreateOutline />New chat</ListButton>
				</VStack>


				<Collapse title="Recent" w="full">
					<VStack alignItems="start" gap="0">
						{chats?.map((chat) =>
							<ListButton
								key={chat.id}
								onClick={() => setChat(chat)}
							>
								{chat.title}
							</ListButton>
						)}
					</VStack>
				</Collapse>

			</VStack>

		</Scroller>
	)
}

export function ChatTime({ dt }: { dt: string }) {
	const format = useFormatter()

	const date = new Date(dt)
	const now = new Date()

	const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	const diffDays = Math.round(
		(today.getTime() - dateDay.getTime()) / 86_400_000,
	)

	const time = format.dateTime(date, {
		hour: "numeric",
		minute: "2-digit",
	})

	if (diffDays === 0) return `Today ${time}`
	if (diffDays === 1) return `Yesterday ${time}`

	return format.dateTime(date, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	})
}

export function ChatBox({ ...props }: StackProps) {
	const ref = useRef<HTMLDivElement>(null)
	const { chat } = useChat()

	const { data: messages, isLoading } = useQuery({
		enabled: !!chat,
		queryFn: () => readChatMessages({ path: { chat_id: chat!.id } }).then((res) => res.data),
		queryKey: ["chat", chat?.id, "messages"],
	})

	useLayoutEffect(() => {
		const el = ref.current

		if (el) {
			el.scrollTo({
				top: el.scrollHeight,
				behavior: "smooth",
			})
		}
	}, [messages])


	if (!chat) {
		if (isLoading)
			return <Box>Loading ...</Box>
		else
			return <Box>Start a chat</Box>
	}

	return (
		<Scroller variant="always" pos="relative" ref={ref}>

			<VStack {...props} gap="9" mx="auto">

				<Text color="fg.muted" fontWeight="medium" fontSize="small">
					<ChatTime dt={chat.created_at} />
				</Text>

				{messages?.map((msg) =>
					<Message key={msg.id} msg={msg} />
				)}

				<Box h="10rem" />
				<ChatInput />
			</VStack>

		</Scroller>
	)
}


export function Message({ msg }: { msg: AiMessageRead }) {

	if (msg.role === "user") {
		return <UserMessage msg={msg} />
	}

	return <AssistantMessage msg={msg} />
}

export function CopyButton({ text, ...props }: { text: string } & IconButtonProps) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		await navigator.clipboard.writeText(text)
		setCopied(true)

		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<IconButton
			aria-label="Copy message"
			size="xs"
			variant="ghost"
			transition="opacity 0.15s"
			onClick={copy}
			{...props}
		>
			{copied ? <LuCheck /> : <LuCopy />}
		</IconButton>
	)
}

export function UserMessage({ msg }: { msg: AiMessageRead }) {
	return (
		<Box
			position="relative"
			alignSelf="end"
			w="70%"
			pb="9"
			_hover={{
				"& .action-buttons": {
					opacity: 1,
				},
			}}
		>
			<Box
				borderRadius="xl"
				bg="primary.muted"
				p="3"
			>
				<Text>{msg.content}</Text>
			</Box>

			<HStack
				className="action-buttons"
				position="absolute"
				bottom="0"
				right="0"
				opacity="0"
				gap="0"
			>
				<CopyButton text={msg.content} />
			</HStack>
		</Box>
	)
}


export function AssistantMessage({ msg }: { msg: AiMessageRead }) {
	return (
		<Box alignSelf="start">
			<Text>
				{msg.content}
			</Text>
		</Box>
	)
}


export function ChatInput() {
	const [value, setValue] = useState("")

	return (
		<Box
			position="absolute"
			bottom="6"
			width="full"
			display="flex"
			alignItems="flex-end"
			justifyContent="center"
		>
			<InputGroup
				zIndex="max"
				maxW="2xl"
				endElement={
					<HStack
						mt="auto"
						position="relative"
						pb="2"
					>
						<IconButton
							minW="unset"
							h="auto"
							p="1.5"
							variant="ghost"
							borderRadius="full"
						>
							<LuMic />
						</IconButton>
						<IconButton
							minW="unset"
							h="auto"
							p="1.5"
							borderRadius="full"
						>
							<BiUpArrowAlt />
						</IconButton>
					</HStack>
				}
			>
				<Textarea
					placeholder="Ask anything"
					borderRadius="4xl"
					bg="bg.muted"
					focusRingColor="border.emphasized"
					autoresize
					alignContent="center"
					ps="5"
					py="1"
					value={value}
					onChange={(e) => setValue(e.currentTarget.value)}
				/>
			</InputGroup>
		</Box>
	)
}


const Scroller = forwardRef<HTMLDivElement, ScrollAreaRootProps>(({ children, ...props }, ref) => {
	return (
		<ScrollArea.Root {...props} pe="3" ref={ref}>
			<ScrollArea.Viewport ref={ref}>
				<ScrollArea.Content spaceY="4" textStyle="sm">

					{children}

				</ScrollArea.Content>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar>
				<ScrollArea.Thumb />
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner />
		</ScrollArea.Root>
	)
})
Scroller.displayName = "Scroller"


function Collapse({ children, title, ...props }: CollapsibleRootProps) {
	return (
		<Collapsible.Root defaultOpen {...props}>
			<Collapsible.Trigger
				display="flex"
				cursor="pointer"
				alignItems="center"
				//w="full"
				color="fg.muted"
			>
				{title}
				<Collapsible.Indicator
					transition="transform 0.2s"
					_open={{ transform: "rotate(90deg)" }}
				>
					<LuChevronRight />
				</Collapsible.Indicator>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Box>
					{children}
				</Box>
			</Collapsible.Content>
		</Collapsible.Root>
	)
}