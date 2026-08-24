"use client"

import { AiMessageRead, createMessage, readChats } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { ChatProvider, useChat } from "./ChatProvider";
import { LuMic, LuRefreshCw } from "react-icons/lu"

import type { ButtonProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { BiUpArrowAlt } from "react-icons/bi"
import { Fragment, useLayoutEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, Collapse, isSameDay, Scroller, CopyButton } from "./utils";


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

export function ChatBox({ ...props }: StackProps) {
	const ref = useRef<HTMLDivElement>(null)
	const { chat, messages, isLoading, waitingMessage } = useChat()

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
					<Text alignSelf={"start"}>{waitingMessage}</Text>
				}

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


export function ChatInput() {
	const [value, setValue] = useState("")
	const { chat, addMessage, messages, setWaitingMessage } = useChat()

	const handleSend = async () => {
		if (!chat)
			return
		if (!value)
			return

		addMessage({
			id: messages[messages.length - 1].id + 1,
			content: value,
			created_at: new Date().toDateString(),
			chat_id: chat.id,
			role: "user"
		})

		setValue("")

		const waitingMessages = [
			"Thinking ...",
			"Working on it please wait ...",
		]

		setWaitingMessage(waitingMessages[0])
		let wmIndex = 0
		const interval = setInterval(() => {
			wmIndex = (wmIndex + 1) % waitingMessages.length
			setWaitingMessage(waitingMessages[wmIndex])
		}, 1000)

		const response = await createMessage({
			body: {
				content: value,
			},
			path: {
				chat_id: chat.id,
			}
		})

		addMessage(response.data)
		clearInterval(interval)
		setWaitingMessage(null)
	}

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
							onClick={handleSend}
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


