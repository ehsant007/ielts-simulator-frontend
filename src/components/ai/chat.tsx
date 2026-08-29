"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea, Center, Menu, Portal, Group, Spinner, Skeleton, Input } from "@chakra-ui/react"

import { LuEllipsis, LuMic, LuPin, LuPinOff, LuRefreshCw, LuTrash } from "react-icons/lu"

import type { InputGroupProps, MenuRootProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { Fragment, useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, Collapse, isSameDay, Scroller, CopyButton, StickToBottomScroller } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { useChats, useMessages } from "./hooks"
import { FaArrowUp } from "react-icons/fa6"
import { BiSolidUpArrow, BiUpArrow, BiUpArrowAlt } from "react-icons/bi"
import { HiArrowUp } from "react-icons/hi"



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
	const { updateMutation: { mutate: updateChat } } = useChats()
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
	const { deleteMutation: { mutate: deleteChat } } = useChats()

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
		<StickToBottomScroller variant="always" pos="relative">
			<Messages chat={chat} {...props} />
		</StickToBottomScroller>
	)
}


export function ChatHome() {
	const { createMutation: { mutate: createChat } } = useChats()

	return (
		<Center w="full">
			<VStack w="full" gap="7">
				<Text fontSize="2xl">Good to see you, Ehsan.</Text>
				<ChatInput onSubmit={(value) => createChat({ message: value, app_id: null })} />
			</VStack>
		</Center>
	)
}


export function Messages({ chat, ...props }: { chat: AiChatRead } & StackProps) {

	const { query: { data: messages = [], isLoading }, createMutation } = useMessages(chat.id)

	const sendMessage = (message: string) => {
		if (!chat || !message.trim() || createMutation.isPending)
			return false
		createMutation.mutate({ chat_id: chat.id, message })
		return true
	}


	if (isLoading)
		return (
			<HStack gap="3" bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4" width="min">
				<Spinner size="sm" colorPalette="blue" />
				<Text fontSize="sm" color="fg.muted">
					Loading...
				</Text>
			</HStack>
		)

	return (
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

			{createMutation.isPending &&
				<Box alignSelf={"start"}>
					<Spinner size="sm" color="primary" />
				</Box>
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
				<ChatInput key={chat.id} onSubmit={sendMessage} />
			</Box>

		</VStack>
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
				borderRadius="full"
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


export function ChatInput({ onSubmit, ...props }: { onSubmit: (value: string) => void } & Omit<InputGroupProps, "children" | "onSubmit">) {
	const chat = useChatStore((s) => s.activeChat)
	const chatId = chat ? chat.id : "default"

	const value = useChatStore((s) => s.drafts[chatId])
	const setDraft = useChatStore((s) => s.setDraft)
	const setValue = (value: string) => setDraft(chatId, value)

	const handleSend = () => {
		if (!value.trim())
			return

		onSubmit(value)
		setValue("")
	}

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
			zIndex="10"
			maxW="2xl"
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
					<IconButton
						minW="unset"
						h="auto"
						p="2"
						borderRadius="full"
						onClick={handleSend}
					>
						<HiArrowUp />
					</IconButton>
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
					setValue(e.currentTarget.value)
				}}

				onKeyDown={(e) => {
					if (e.shiftKey)
						return
					if (e.key === "Enter") {
						e.preventDefault()
						handleSend()
					}
				}}
			/>
		</InputGroup>
	)
}
