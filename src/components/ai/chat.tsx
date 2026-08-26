"use client"

import { AiMessageRead } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea, Center } from "@chakra-ui/react"
import { ChatProvider, useChat } from "./ChatProvider";
import { LuMic, LuRefreshCw } from "react-icons/lu"

import type { ButtonProps, InputGroupProps, StackProps } from "@chakra-ui/react"
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
	const { chat, chats, setChat } = useChat()

	return (
		<Scroller w="18rem" variant="always" borderEnd="sm" borderColor="border">

			<VStack alignItems="start" {...props}>

				<VStack w="full">
					<ListButton
						onClick={() => setChat(null)}
					>
						<IoCreateOutline />New chat
					</ListButton>
				</VStack>


				<Collapse title="Recent" w="full">
					<VStack alignItems="start" gap="0" mt="1">
						{chats?.map((c) =>
							<ListButton
								key={c.id}
								onClick={() => setChat(c)}
								bg={c.id === chat?.id ? "primary.subtle" : "none"}
							>
								{c.title}
							</ListButton>
						)}
					</VStack>
				</Collapse>

			</VStack>

		</Scroller>
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


