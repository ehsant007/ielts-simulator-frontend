"use client"

import { AiChatRead, AiMessageRead } from "@/client"
import { VStack, Text, Button, HStack, Box, InputGroup, IconButton, Textarea, Center, Menu, Portal, Group, Spinner, Skeleton, Icon, useBreakpointValue, Drawer, CloseButton, Popover, Input } from "@chakra-ui/react"

import { LuEllipsis, LuMessageCircle, LuMic, LuPin, LuPinOff, LuRefreshCw, LuTrash } from "react-icons/lu"

import type { BoxProps, ButtonProps, GroupProps, InputGroupProps, MenuRootProps, ScrollAreaScrollbarProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { Fragment, useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { ChatTime, Collapse, isSameDay, Scroller, CopyButton, StickToBottomScroller } from "./utils";
import { ChatStoreProvider, useChatStore } from "./ChatProvider";
import { messageCreateKey, useChats, useMessageCreateMutation, useMessages } from "./hooks"
import { HiArrowUp, HiMenuAlt2 } from "react-icons/hi"
import { BsCircleFill, BsPinAngle, BsStopFill } from "react-icons/bs"
import { useIsMutating } from "@tanstack/react-query"
import { RxPanelLeft } from "react-icons/rx";
import { AnimatePresence, motion } from "motion/react"

const MotionBox = motion.create(Box)



export function ChatPanel() {

	return (
		<ChatStoreProvider>
			<HStack h="full" gap="0" pos="relative">
				<ChatSidebar />
				<ChatBox maxW="4xl" p="5" mx="auto" />
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
						<ChatInput2 />
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
				bottom="6"
				left="0"
				w="full"
			>
				<Box {...props}>
					<ChatInput2 key={chat.id} />
				</Box>
			</Box>
		</StickToBottomScroller>
	)
}


export function ChatSidebar() {
	const isMobile = useBreakpointValue({ base: true, md: false, })

	if (isMobile) {
		return <SmallScreenSidebar />
	}

	return (
		<BigScreenSidebar />
	)

}

export function SmallScreenSidebar() {
	const { query: { data: chats = [], isLoading } } = useChats()
	const pinned = chats?.filter((chat) => chat.pinned)
	const recent = chats?.filter((chat) => !chat.pinned)

	return (
		<Drawer.Root placement="start">
			<Drawer.Trigger asChild>
				<IconButton
					pos="absolute"
					variant="ghost"
					size="md"
					top="2"
					left="2"
					zIndex="10"
				>
					<HiMenuAlt2 />
				</IconButton>
			</Drawer.Trigger>
			<Portal>
				<Drawer.Backdrop />
				<Drawer.Positioner>
					<Drawer.Content>
						<Drawer.Header>
							{/* <Drawer.Title>Drawer Title</Drawer.Title> */}
						</Drawer.Header>
						<Drawer.Body pe="0">
							<ChatList
								pe="2"
								pinedChats={pinned}
								recentChats={recent}
								loading={isLoading}
							/>
						</Drawer.Body>
						<Drawer.Footer>
							{/* <Button variant="outline">Cancel</Button>
								<Button>Save</Button> */}
						</Drawer.Footer>
						<Drawer.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Drawer.CloseTrigger>
					</Drawer.Content>
				</Drawer.Positioner>
			</Portal>
		</Drawer.Root>
	)
}


export function BigScreenSidebar() {
	const { query: { data: chats = [], isLoading } } = useChats()
	const pinned = chats?.filter((chat) => chat.pinned)
	const recent = chats?.filter((chat) => !chat.pinned)

	const [collapse, setCollapse] = useState(false)

	return (
		<Box
			pt="4rem"
			ps="3"
			w={collapse ? "4rem" : "18rem"}
			h="full"
			borderEnd="xs"
			borderColor="border"
			pos="relative"
			transition="width 0.2s ease"
		>
			<IconButton
				pos="absolute"
				variant="ghost"
				size="md"
				top="2"
				right={collapse ? "center" : "2"}
				onClick={() => setCollapse(prev => !prev)}
			>
				<RxPanelLeft />
			</IconButton>

			<VStack h="full" >
				<ActionButtons pinedChats={pinned} recentChats={recent} collapse={collapse} pe="2" />

				<ChatList
					pe="2"
					pinedChats={pinned}
					recentChats={recent}
					loading={isLoading}
					opacity={collapse ? "0" : "1"}
					transition="opacity 0.2s ease"
				/>
			</VStack>
		</Box>
	)
}



export function ActionButton(props: ButtonProps) {
	return (
		<Button
			variant="ghost"
			color="fg"
			size="sm"
			fontWeight="normal"
			borderRadius="xl"
			w="full"

			{...props}
		>
			{props.children}
		</Button>
	)
}

export function ActionButtons({ collapse, pinedChats, recentChats, ...props }: { pinedChats: AiChatRead[], recentChats: AiChatRead[], collapse: boolean } & StackProps) {
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const f = (icon: React.ReactNode, name: string) => {
		if (collapse)
			return icon

		return <>
			{icon}{name}
		</>
	}

	const justify = () => collapse ? "center" : "start"

	return (
		<VStack w="full" {...props}>
			<ActionButton
				justifyContent={justify()}
				onClick={() => setActiveChat(null)}
			>
				{f(<IoCreateOutline />, "New chat")}
			</ActionButton>

			{collapse &&
				<>
					<ChatListMenu
						trigger={
							<ActionButton>
								<BsPinAngle />
							</ActionButton>
						}
					>
						<ChatButtonList
							chats={pinedChats}
							placeholder="Pin chats to list them here."
						/>
					</ChatListMenu>


					<ChatListMenu
						trigger={
							<ActionButton>
								<LuMessageCircle />
							</ActionButton>
						}
					>
						<ChatButtonList
							chats={recentChats}
							placeholder="No chats to list!"
						/>
					</ChatListMenu>
				</>
			}

		</VStack>
	)
}



export function ChatListMenu({ children, trigger }: { children: React.ReactNode, trigger: React.ReactNode }) {
	return (
		<Popover.Root positioning={{ placement: "bottom-start", offset: { crossAxis: 0, mainAxis: -50 } }}>
			<Popover.Trigger asChild>
				{trigger}
			</Popover.Trigger>
			<Portal>
				<Popover.Positioner>
					<Popover.Content maxH="40rem" minW="18rem" p="3" ms="2.8rem" maxHeight="40dvh" overflowY="auto">
						{children}
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	)
}


export function ChatButtonList({ chats, placeholder }: { chats: AiChatRead[], placeholder?: string }) {
	return (
		<VStack alignItems="start" gap="0" mt="1">
			<AnimatePresence>
				{chats.map((c) =>
					<MotionBox
						w="full"
						key={c.id}
						layout
						initial={{ opacity: 0, scale: 0.0 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.0 }}
						transition={{ duration: 0.2 }}
					>
						<ChatButton chat={c} />
					</MotionBox>
				)}
			</AnimatePresence>
			{chats.length === 0 && placeholder &&
				<Text color="fg.subtle" mx="auto">{placeholder}</Text>
			}
		</VStack>
	)
}


export function ChatList({ pinedChats, recentChats, loading, ...props }: { pinedChats: AiChatRead[], recentChats: AiChatRead[], loading: boolean } & ScrollAreaScrollbarProps) {
	return (
		<Scroller w="full" variant="always" {...props}>

			<VStack alignItems="start" gap="5">
				{pinedChats.length > 0 &&
					<Collapse
						title={
							<Text fontWeight="medium" fontSize="sm">
								Pinned
							</Text>
						}
						w="full"
					>
						<ChatButtonList chats={pinedChats} />
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
					<ChatButtonList chats={recentChats} />

					{loading &&
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

export function ChatButton({ chat, ...props }: { chat: AiChatRead } & GroupProps) {
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
			{...props}
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


export function ChatInput2({ ...props }: ChatInputProps) {
	const activeChat = useChatStore((s) => s.activeChat)
	const setActiveChat = useChatStore((s) => s.setActiveChat)

	const chatId = activeChat?.id ?? "default"

	const userMsg = useChatStore(s => s.drafts[chatId])
	const setDraft = useChatStore(s => s.setDraft)
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

	const isMobile = useBreakpointValue({ base: true, md: false, })

	const expand = isMobile || multiLines


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
					h={expand ? "wrap" : "full"}
					pb={expand ? "2" : "unset"}
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

				pb={expand ? "4rem" : "4"}
				pe={expand ? "5" : "6rem"}

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
