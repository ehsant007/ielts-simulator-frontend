"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea, Center, Menu, Portal, Group, Spinner, Skeleton, Icon } from "@chakra-ui/react"

import { LuEllipsis, LuMic, LuPin, LuPinOff, LuRefreshCw, LuTrash } from "react-icons/lu"

import type { InputGroupProps, MenuRootProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { Fragment, useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, Collapse, isSameDay, Scroller, CopyButton, StickToBottomScroller } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { messageCreateKey, useChats, useMessageCreateMutation, useMessages } from "./hooks"
import { HiArrowUp } from "react-icons/hi"
import { BsCircleFill, BsStopFill } from "react-icons/bs"
import { useIsMutating } from "@tanstack/react-query"



export function ChatPanel() {

	return (
		<ChatStoreProvider>
			<HStack h="100%">
				<ChatList p="2" />
				<ChatBox maxW="3xl" p="5" />
			</HStack>
		</ChatStoreProvider>
	)
}


export function ChatList({ ...props }: StackProps) {
	const setActiveChat = useChatStore((s) => s.setActiveChat)
	const { query: { data: chats = [], isLoading } } = useChats()

	const pinned = chats?.filter((chat) => chat.pinned)
	const recent = chats?.filter((chat) => !chat.pinned)

	return (
		<Scroller w="18rem" variant="always" borderEnd="sm" borderColor="border">

			<VStack alignItems="start" gap="5" {...props}>

				<VStack w="full">

					<Button
						variant="ghost"
						color="fg"
						size="sm"
						fontWeight="normal"
						justifyContent="start"
						borderRadius="xl"
						w="full"
						onClick={() => setActiveChat(null)}
					>

						<IoCreateOutline />New chat
					</Button>
				</VStack>


				{pinned.length > 0 &&
					<Collapse
						title={
							<Text fontWeight="medium" fontSize="sm">
								Pinned
							</Text>
						}
						w="full"
					>
						<VStack alignItems="start" gap="0" mt="1">
							{pinned.map((c) =>
								<ChatButton key={c.id} chat={c} />
							)}
						</VStack>
					</Collapse>
				}

				<Collapse
					title={
						<Text fontWeight="medium" fontSize="sm">
							Recent
						</Text>
					}
					w="full"
				>
					<VStack alignItems="start" gap="0" mt="1">
						{recent.map((c) =>
							<ChatButton key={c.id} chat={c} />
						)}
					</VStack>

					{isLoading &&
						<VStack flex="1">
							{Array.from({ length: 10 }, (_, i) => (
								<Skeleton w="full" key={i} height="8" borderRadius="xl" />
							))}
						</VStack>
					}
				</Collapse>

			</VStack>

		</Scroller>
	)
}

export function ChatButton({ chat }: { chat: AiChatRead }) {
	const activeChat = useChatStore((s) => s.activeChat)
	const setActiveChat = useChatStore((s) => s.setActiveChat)
	const { update: { mutate: updateChat } } = useChats()
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<Group
			key={chat.id}
			_hover={{
				"& .chat-action-menu": {
					opacity: 1,
				},
				bg: "primary.subtle",
			}}
			bg={chat.id === activeChat?.id ? "primary.subtle" : menuOpen ? "primary.subtle/60" : "none"}
			w="full"
			attached
			borderRadius="xl"
		>
			<Button
				variant="ghost"
				color="fg"
				size="sm"
				fontWeight="normal"
				justifyContent="start"
				borderRadius="xl"
				flex="1"
				onClick={() => setActiveChat(chat)}
			>
				{chat.title}
			</Button>

			<HStack
				className="chat-action-menu"
				opacity={menuOpen ? "1" : "0"}
				gap="0"
			>
				<IconButton
					variant="ghost"
					size="sm"
					borderRadius="xl"
					onClick={() => updateChat({ chat_id: chat.id, data: { pinned: !chat.pinned } })}
				>
					{chat.pinned ? <LuPinOff /> : <LuPin />}
				</IconButton>

				<ChatActionMenu
					chat={chat}
					open={menuOpen}
					onOpenChange={(e) => setMenuOpen(e.open)}
				>
					<IconButton
						variant="ghost"
						size="sm"
						ms="auto"
						borderRadius="xl"
						focusRing="none"
					>
						<LuEllipsis />
					</IconButton>
				</ChatActionMenu >
			</HStack>
		</Group>
	)
}


export function ChatActionMenu({ chat, children, ...props }: { chat: AiChatRead } & MenuRootProps) {
	const { remove: { mutate: deleteChat } } = useChats()

	return (
		<Menu.Root {...props}>
			<Menu.Trigger asChild>
				{children}
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.ItemGroup>
							<Menu.Item value="rename"><MdEdit />Rename</Menu.Item>
						</Menu.ItemGroup>
						<Menu.Separator />
						<Menu.ItemGroup>
							<Menu.Item
								value="delete"
								color="fg.error"
								_hover={{ bg: "bg.error", color: "fg.error" }}
								onClick={() => deleteChat(chat.id)}
							>
								<LuTrash />Delete
							</Menu.Item>
						</Menu.ItemGroup>
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	)
}


export function ChatBox(props: StackProps) {
	const chat = useChatStore((s) => s.activeChat)

	if (!chat)
		return <ChatHome />

	return (

		<Messages chat={chat} {...props} />
	)
}


export function ChatHome() {
	return (
		<Center w="full">
			<VStack w="full" gap="7">
				<Text fontSize="2xl">Good to see you, Ehsan.</Text>
				<ChatInput2 />
			</VStack>
		</Center>
	)
}


export function Messages({ chat, ...props }: { chat: AiChatRead } & StackProps) {
	const { query: { data: messages = [], isLoading } } = useMessages(chat.id)

	const isPending = useIsMutating({ mutationKey: messageCreateKey }) > 0

	if (isLoading)
		return (
			<Center w="full">
				<Spinner size="xl" color="primary" borderWidth="thick" />
				{/* <Spinner asChild borderWidth="0" size="lg">
					<LuLoader />
				</Spinner> */}
			</Center>
		)

	return (
		<StickToBottomScroller variant="always" pos="relative">
			<VStack {...props} gap="3" mx="auto">

				{messages.map((msg, index) => {
					const previous = messages[index - 1]
					const showDate = !previous || !isSameDay(previous.created_at, msg.created_at)

					return (
						<Fragment key={msg.id}>
							{showDate && (
								<Text
									color="fg.muted"
									fontWeight="medium"
									fontSize="small"
								>
									<ChatTime dt={msg.created_at} />
								</Text>
							)}

							<Message msg={msg} />
						</Fragment>
					)
				})}

				{isPending &&
					<Icon
						as={BsCircleFill}
						alignSelf={"start"}
						size="md"
						color="primary"
						animationName="breathing"
						animationDuration="1.5s"
						animationTimingFunction="ease-in-out"
						animationIterationCount="infinite"
					/>
				}


				<Box h="10rem" />

				<Box
					position="absolute"
					bottom="6"
					width="full"
					display="flex"
					alignItems="flex-end"
					justifyContent="center"
				>
					<ChatInput2 key={chat.id} />
				</Box>

			</VStack>
		</StickToBottomScroller>
	)
}


export function ChatInput2({ ...props }: ChatInputProps) {
	const activeChat = useChatStore((s) => s.activeChat)
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const chatId = activeChat?.id ?? "default"

	const userMsg = useChatStore(s => s.drafts[chatId])
	const setDraft = useChatStore(s=>s.setDraft)
	const setUserMsg = (value: string) => setDraft(chatId, value)

	const { create: { mutate: createMessage } } = useMessageCreateMutation({
		onCreate: () => {
			setUserMsg("")
		},

		onError: (msg) => {
			setUserMsg(msg.content)
		},
	})

	const { create: chatCreateMutation } = useChats({
		onCreateSuccess: (chat) => {
			setActiveChat(chat)
			createMessage({ message: userMsg, chat_id: chat.id })
		}
	})

	const handleSend = () => {
		if (!userMsg.trim() || chatCreateMutation.isPending)
			return

		if (activeChat == null)
			chatCreateMutation.mutate({ message: userMsg, app_id: null })
		else
			createMessage({ message: userMsg, chat_id: activeChat.id })
	}

	return (
		<ChatInput
			value={userMsg}
			onValueChange={(value) => setUserMsg(value)}
			onSend={handleSend}
			onStop={() => { }}
			pending={chatCreateMutation.isPending}

			zIndex="10"
			maxW="3xl"
			mx="3"
			{...props}
		/>
	)
}


export function Message({ msg }: { msg: AiMessageRead }) {

	if (msg.role === "user") {
		return <UserMessage msg={msg} />
	}

	return <AssistantMessage msg={msg} />
}

export function UserMessage({ msg }: { msg: AiMessageRead }) {
	return (
		<Box
			position="relative"
			alignSelf="end"
			maxW="70%"
			pb="9"
			_hover={{
				"& .action-buttons": {
					opacity: 1,
				},
			}}
		>
			<Box
				borderStartRadius="3xl"
				borderEndEndRadius="3xl"
				bg="primary.muted"
				p="4"
			>
				<Text whiteSpace="pre-wrap">{msg.content}</Text>
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
				<IconButton
					aria-label="Edit message"
					size="xs"
					variant="ghost"
				>
					<MdEdit />
				</IconButton>
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

			<HStack gap="0" mt="1">
				<CopyButton text={msg.content} color="fg.muted" />
				<IconButton
					aria-label="Try again"
					size="xs"
					variant="ghost"
					transition="opacity 0.15s"
					color="fg.muted"
				>
					<LuRefreshCw />
				</IconButton>
			</HStack>
		</Box>
	)
}


type ChatInputProps = {
	value?: string
	onValueChange?: (value: string) => void
	onSend?: () => void
	onStop?: () => void
	pending?: boolean
} & Omit<InputGroupProps, "children">

export function ChatInput({ value, onValueChange, onSend, onStop, pending, ...props }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const singleLineHeight = useRef(-1)

	const [multiLines, setMultiLines] = useState(false)

	useEffect(() => {
		const el = textareaRef.current
		if (!el)
			return

		if (singleLineHeight.current < 0)
			singleLineHeight.current = el.getBoundingClientRect().height
	}, [])

	return (
		<InputGroup
			endElement={
				<HStack
					mt="auto"
					position="relative"
					h={multiLines ? "wrap" : "full"}
					pb={multiLines ? "2" : "unset"}
					gap="3"
				>
					<IconButton
						minW="unset"
						h="auto"
						p="2"
						variant="ghost"
						borderRadius="full"
					>
						<LuMic />
					</IconButton>
					{pending
						?
						<IconButton
							minW="unset"
							h="auto"
							p="2"
							borderRadius="full"
							onClick={onStop}
						>
							<BsStopFill />
						</IconButton>
						:
						<IconButton
							minW="unset"
							h="auto"
							p="2"
							borderRadius="full"
							onClick={onSend}
						>
							<HiArrowUp />
						</IconButton>
					}
				</HStack>
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
				rows={1}
				alignContent="center"
				ps="5"
				pt="4"

				pb={multiLines ? "12" : "4"}
				pe={multiLines ? "5" : "6rem"}

				size="lg"
				autoresize
				autoFocus

				value={value}
				onChange={(e) => {
					if (!e.currentTarget.value)
						setMultiLines(false)
					else
						setMultiLines(e.currentTarget.scrollHeight > singleLineHeight.current)
					onValueChange?.(e.currentTarget.value)
				}}


				onKeyDown={(e) => {
					if (e.key !== "Enter" || e.shiftKey)
						return

					e.preventDefault()
					onSend?.()
				}}
			/>
		</InputGroup>
	)
}
