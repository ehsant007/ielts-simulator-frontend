"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea, Center, Menu, Portal, Group } from "@chakra-ui/react"
import { ChatProvider, useChat } from "./ChatProvider";
import { LuEllipsis, LuMic, LuPin, LuPinOff, LuRefreshCw, LuTrash } from "react-icons/lu"

import type { InputGroupProps, MenuRootProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { BiUpArrowAlt } from "react-icons/bi"
import { Fragment, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, Collapse, isSameDay, Scroller, CopyButton, StickToBottomScroller, TextWriter } from "./utils";


export function ChatPanel() {

	return (
		<ChatProvider>
			<HStack
				h="100%"
			>
				<ChatList p="2" />
				<ChatBox maxW="3xl" p="5" />
			</HStack>
		</ChatProvider>
	)
}


export function ChatList({ ...props }: StackProps) {
	const { chats, setChat } = useChat()

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
						onClick={() => setChat(null)}
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
				</Collapse>

			</VStack>

		</Scroller>
	)
}

export function ChatButton({ chat }: { chat: AiChatRead }) {
	const { chat: selectedChat, setChat, updateChat } = useChat()
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
			bg={chat.id === selectedChat?.id ? "primary.subtle" : menuOpen ? "primary.subtle/60" : "none"}
			w="full"
			attached
			borderRadius="xl"
		>
			<Button
				variant="ghost"
				color="fg"
				size="xs"
				fontWeight="normal"
				justifyContent="start"
				borderRadius="xl"
				flex="1"
				onClick={() => setChat(chat)}
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
					size="xs"
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
						size="xs"
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
	const { deleteChat } = useChat()

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

export function ChatHome() {
	const { createChat } = useChat()

	return (
		<Center w="full">
			<VStack w="full" gap="7">
				<Text fontSize="2xl">Good to see you, Ehsan.</Text>
				<ChatInput onSubmit={(value) => createChat({ message: value, app_id: null })} />
			</VStack>
		</Center>
	)
}

export function ChatBox({ ...props }: StackProps) {
	const { chat, messages, isLoading, waitingMessage, sendMessage } = useChat()

	if (!chat) {
		if (isLoading)
			return <Box>Loading ...</Box>
		else
			return <ChatHome />
	}

	return (
		<StickToBottomScroller variant="always" pos="relative">

			<VStack {...props} gap="3" mx="auto">

				{messages?.map((msg, index) => {
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

				{waitingMessage &&
					<Text alignSelf={"start"} color="fg.info">
						<TextWriter>{waitingMessage}</TextWriter>
					</Text>
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

		</StickToBottomScroller>
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


export function ChatInput({ onSubmit, ...props }: { onSubmit: (value: string) => boolean } & Omit<InputGroupProps, "children" | "onSubmit">) {

	const { drafts, setDrafts, chat } = useChat()

	const chatId = chat ? chat.id : "starting-new-chat"
	const value = drafts[chatId] ?? ""
	const setValue = (value: string) => setDrafts(prev => ({ ...prev, [chatId]: value }))

	const handleSend = () => {
		if (!value.trim())
			return

		if (onSubmit(value))
			setValue("")
	}

	return (
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
						onClick={handleSend}
					>
						<BiUpArrowAlt />
					</IconButton>
				</HStack>
			}

			{...props}
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
				autoFocus
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


