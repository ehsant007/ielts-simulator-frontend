"use client"

import { AiMessageCreate, AiMessageRead } from "@/client"
import { VStack, Text, HStack, Box, IconButton, Center, Spinner, Icon, ClientOnly } from "@chakra-ui/react"
import { LuArrowDown, LuRefreshCw } from "react-icons/lu"
import type { BoxProps, StackProps } from "@chakra-ui/react"
import { Fragment, useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, isSameDay, CopyButton, StickToBottomScroller, PartialCollapse } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { messageCreateKey, useMessagesQuery } from "./hooks"
import { BsCircleFill } from "react-icons/bs"
import { useMutationState } from "@tanstack/react-query"
import { ChatInput } from "./ChatInput"
import { ChatSidebar } from "./ChatSidebar"
import { useStickToBottom } from "use-stick-to-bottom"
import { Markdown } from "./Markdown"
import { MessageNavigator } from "./MessageNavigator"


export function ChatPanel({ initialChatId }: { initialChatId?: string }) {

	return (
		<ClientOnly>
			<ChatStoreProvider initialChatId={initialChatId}>
				<HStack h="full" gap="0" pos="relative">
					<ChatSidebar />
					<ChatBox maxW="3xl" py="6" px="8" mx="auto" />
				</HStack>
			</ChatStoreProvider>
		</ClientOnly>
	)
}


export function ChatBox(props: BoxProps) {
	const chatId = useChatStore(s => s.activeChatId)

	const sticky = useStickToBottom({
		initial: "instant",
		resize: "smooth",
	})

	const inputRef = useRef<HTMLDivElement>(null)
	const [inputHeight, setInputHeight] = useState(0)

	useEffect(() => {
		const element = inputRef.current
		if (!element) return

		let timeout: ReturnType<typeof setTimeout>

		const observer = new ResizeObserver(([entry]) => {
			clearTimeout(timeout)

			timeout = setTimeout(() => {
				setInputHeight(entry.contentRect.height)
			}, 100)
		})

		observer.observe(element)

		return () => {
			clearTimeout(timeout)
			observer.disconnect()
		}
	}, [chatId])

	if (!chatId)
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
			sticky={sticky}
		>
			<Box {...props}>
				<Messages chatId={chatId} mb="5rem" pb={`${inputHeight}px`} />
			</Box>

			<Box
				position="absolute"
				bottom="0"
				left="0"
				right="0"
			>
				<Box {...props} pt="0" mt="0">
					<VStack gap="5">
						{!sticky.isAtBottom &&
							<IconButton
								size="sm"
								variant="solid"
								borderRadius="full"
								colorPalette="primary"
								opacity="40%"
								_hover={{ opacity: "100%" }}
								onClick={() => sticky.scrollToBottom()}
							>
								<LuArrowDown />
							</IconButton>
						}

						<Box w="full" ref={inputRef}>
							<ChatInput onMessageCreate={() => sticky.scrollToBottom()} key={chatId} />
						</Box>
					</VStack>
				</Box>
			</Box>

			<Box
				position="absolute"
				top="50%"
				transform="translateY(-50%)"
				right="0"
				pe="4"
				display={{ lgDown: "none", lg: "block" }}
			>
				<MessageNavigator chatId={chatId} />
			</Box>

		</StickToBottomScroller>
	)
}


export function Messages({ chatId, ...props }: { chatId: string } & StackProps) {
	const streamingMessage = useChatStore((s) => s.streamingMessages[chatId])

	const streamingMsg: AiMessageRead = {
		id: "streaming_id",
		chat_id: chatId,
		content: streamingMessage,
		role: "assistant",
		created_at: "now",
	}

	const {
		isLoading,
		hasPreviousPage,
		isFetchingPreviousPage,
		fetchPreviousPage,
		messages,
	} = useMessagesQuery(chatId)


	const isMessageCreating = useMutationState({
		filters: {
			mutationKey: messageCreateKey,
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as AiMessageCreate).chat_id === chatId,
	}).some(Boolean)


	const topRef = useRef<HTMLDivElement>(null) // Sentinel

	useEffect(() => {
		const element = topRef.current
		if (!element) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					hasPreviousPage &&
					!isFetchingPreviousPage
				) {
					fetchPreviousPage()
				}
			},
			{
				// Start loading before the user actually reaches the top.
				rootMargin: "500px 0px 0px 0px",
			}
		)

		observer.observe(element)

		return () => observer.disconnect()
	}, [
		hasPreviousPage,
		isFetchingPreviousPage,
		fetchPreviousPage,
	])


	if (isLoading)
		return (
			<Center position="absolute" inset="0">
				<Spinner size="xl" color="primary" borderWidth="thick" />
			</Center>
		)

	return (

		<VStack w="full" gap="3" mx="auto" {...props}>

			<Box ref={topRef} h="1px" />

			{isFetchingPreviousPage &&
				<Spinner mt="5rem" size="xl" color="primary" borderWidth="thick" />
			}

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

			{isMessageCreating && (
				streamingMessage
					? <AssistantMessage msg={streamingMsg} />
					: <Icon
						as={BsCircleFill}
						alignSelf={"start"}
						size="md"
						color="primary"
						animationName="breathing"
						animationDuration="1.5s"
						animationTimingFunction="ease-in-out"
						animationIterationCount="infinite"
					/>
			)}

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

			id={msg.id}
		>
			<Box
				borderStartRadius="3xl"
				borderEndEndRadius="3xl"
				bg="primary.muted"
				p="4"
			>
				<PartialCollapse collapsedHeight="20rem" bg="primary.muted">
					<Text whiteSpace="pre-wrap" overflowWrap="anywhere">{msg.content}</Text>
				</PartialCollapse>
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
		<Box alignSelf="start" w="full">

			<Markdown>
				{msg.content}
			</Markdown>

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
