"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, HStack, Box, IconButton, Center, Spinner, Icon } from "@chakra-ui/react"
import { LuRefreshCw } from "react-icons/lu"
import type { BoxProps, StackProps } from "@chakra-ui/react"
import { Fragment } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, isSameDay, CopyButton, StickToBottomScroller } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { messageCreateKey, useMessages } from "./hooks"
import { BsCircleFill } from "react-icons/bs"
import { useIsMutating } from "@tanstack/react-query"
import { ChatInput } from "./ChatInput"
import { ChatSidebar } from "./ChatSidebar"


export function ChatPanel() {

	return (
		<ChatStoreProvider>
			<HStack h="full" gap="0" pos="relative">
				<ChatSidebar />
				<ChatBox maxW="50rem" p="5" mx="auto" />
			</HStack>
		</ChatStoreProvider>
	)
}


export function ChatBox(props: BoxProps) {
	const chat = useChatStore((s) => s.activeChat)

	if (!chat)
		return (
			<Box display="flex" w="full" h="100%" mx="auto" {...props} >
				<Center w="full">
					<VStack w="full" gap="7">
						<Text fontSize="2xl">Good to see you, Ehsan.</Text>
						<ChatInput />
					</VStack>
				</Center>
			</Box>
		)

	return (
		<StickToBottomScroller
			variant="always"
			pos="relative"
		>
			<Box {...props}>
				<Messages chat={chat} />
			</Box>

			<Box
				position="absolute"
				bottom="2"
				left="0"
				w="full"
			>
				<Box {...props}>
					<ChatInput key={chat.id} />
				</Box>
			</Box>
		</StickToBottomScroller>
	)
}


export function Messages({ chat, ...props }: { chat: AiChatRead } & StackProps) {
	const { query: { data: messages = [], isLoading } } = useMessages(chat.id)

	const isPending = useIsMutating({ mutationKey: messageCreateKey }) > 0

	if (isLoading)
		return (
			<Center w="full">
				<Spinner size="xl" color="primary" borderWidth="thick" />
			</Center>
		)

	return (

		<VStack w="full" gap="3" mx="auto" {...props}>

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
