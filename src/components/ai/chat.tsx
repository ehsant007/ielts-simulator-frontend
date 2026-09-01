"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, HStack, Box, IconButton, Center, Spinner, Icon, List } from "@chakra-ui/react"
import { LuArrowDown, LuRefreshCw } from "react-icons/lu"
import type { BoxProps, StackProps } from "@chakra-ui/react"
import { Fragment, useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, isSameDay, CopyButton, StickToBottomScroller } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { messageCreateKey, useMessages } from "./hooks"
import { BsCircleFill } from "react-icons/bs"
import { useIsMutating } from "@tanstack/react-query"
import { ChatInput } from "./ChatInput"
import { ChatSidebar } from "./ChatSidebar"




import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useStickToBottom } from "use-stick-to-bottom"

export function MD({ children, id }: { children: string, id: string }) {
	let count = 0
	const getId = () => `${id}-n${count++}`

	return <Markdown rehypePlugins={[rehypeRaw]} components={{
		h1({ children }) {
			return <Text id={getId()} textStyle="4xl">{children}</Text>
		},
		h2({ children }) {
			return <Text id={getId()} textStyle="3xl">{children}</Text>
		},
		h3({ children }) {
			return <Text id={getId()} textStyle="2xl">{children}</Text>
		},
		h4({ children }) {
			return <Text id={getId()} textStyle="xl">{children}</Text>
		},
		h5({ children }) {
			return <Text id={getId()} textStyle="lg">{children}</Text>
		},
		h6({ children }) {
			return <Text id={getId()} textStyle="md">{children}</Text>
		},
		p({ children }) {
			return <Text id={getId()} my="2" overflowWrap="anywhere">{children}</Text>
		},
		ul({ children }) {
			return <List.Root ps="5" listStyleType="disc">{children}</List.Root>
		},
		li({ children }) {
			return <Text id={getId()}>{children}</Text>
		},
		strong({ children }) {
			return (
				<Text
					as="span"
					fontWeight="bold"
					id={getId()}
				>
					{children}
				</Text>
			)
		},
		center({ children }) {
			return (
				<Center as="span">
					<Text as="span" textAlign="center" id={getId()}>
						{children}
					</Text>
				</Center>
			)
		},
	}} >
		{children}
	</Markdown>
}



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
	const sticky = useStickToBottom()

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
	}, [chat])

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
			sticky={sticky}
		>
			<Box {...props}>
				<Messages chat={chat} mb="5rem" pb={`${inputHeight}px`} />
			</Box>

			<Box
				position="absolute"
				bottom="2"
				left="0"
				w="full"
			>
				<Box {...props} pt="0" mt="0">
					<VStack gap="5">
						{!sticky.isAtBottom &&
							<IconButton
								size="sm"
								variant="solid"
								borderRadius="full"
								bg="primary.muted"
								opacity="80%"
								_hover={{ opacity: "100%" }}
								onClick={() => sticky.scrollToBottom()}
							>
								<LuArrowDown />
							</IconButton>
						}

						<Box w="full" ref={inputRef}>
							<ChatInput key={chat.id} />
						</Box>
					</VStack>
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
				<Text whiteSpace="pre-wrap" overflowWrap="anywhere">{msg.content}</Text>
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
			<MD id={msg.id}>
				{msg.content}
			</MD>

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
