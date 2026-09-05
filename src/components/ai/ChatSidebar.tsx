import { AiChatRead } from "@/client"
import { VStack, Text, Button, HStack, Box, IconButton, Menu, Portal, Group, Skeleton, Drawer, CloseButton, Popover } from "@chakra-ui/react"
import { LuEllipsis, LuMessageCircle, LuPin, LuPinOff, LuTrash } from "react-icons/lu"
import type { ButtonProps, GroupProps, MenuRootProps, ScrollAreaScrollbarProps, StackProps } from "@chakra-ui/react"
import { IoCreateOutline } from "react-icons/io5"
import { useEffect, useRef, useState } from "react"
import { MdEdit } from "react-icons/md"
import { Collapse, Scroller } from "./utils";
import { useChatStore } from "./ChatProvider";
import { useChatRemoveMutation, useChatUpdateMutation } from "./hooks"
import { HiMenuAlt2 } from "react-icons/hi"
import { BsPinAngle } from "react-icons/bs"
import { RxPanelLeft } from "react-icons/rx";
import { AnimatePresence, motion } from "motion/react"
import { SidebarProvider, useSidebar } from "./SidebarProvider"

const MotionBox = motion.create(Box)

export function ChatSidebar() {
	return (
		<SidebarProvider>
			<Box h="full" display={{ base: "block", md: "none" }}>
				<MobileSidebar />
			</Box>

			<Box h="full" display={{ base: "none", md: "block" }}>
				<DesktopSidebar />
			</Box>
		</SidebarProvider>
	)
}

export function MobileSidebar() {
	const [open, setOpen] = useState(false)

	return (
		<Drawer.Root
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			placement="start"
		>
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
						<Drawer.Body
							pe="0"
							onClick={(e) => setOpen(!(e.target as HTMLElement).getAttribute("data-close-sidebar"))}
						>

							<SideBar />

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


export function DesktopSidebar() {
	const [collapse, setCollapse] = useState(false)

	return (
		<Box
			pt="4rem"
			ps="2"
			w={collapse ? "4rem" : "16.5rem"}
			flexShrink="0"
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

			<SideBar collapse={collapse} />
		</Box>
	)
}

export type SideBarProps = {
	collapse?: boolean,
}

export function SideBar({ collapse }: SideBarProps) {

	return (
		<VStack h="full" >
			<ActionButtons collapse={collapse} pe="2" pb="3" />

			<ChatList
				pe="2"
				opacity={collapse ? "0" : "1"}
				transition="opacity 0.2s ease"
			/>
		</VStack>
	)
}


export function ActionButtons({ collapse, ...props }: { collapse?: boolean } & StackProps) {
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
						<PinnedChats />
					</ChatListMenu>


					<ChatListMenu
						trigger={
							<ActionButton>
								<LuMessageCircle />
							</ActionButton>
						}
					>
						<RecentChats />
					</ChatListMenu>
				</>
			}

		</VStack>
	)
}


export function ActionButton(props: ButtonProps) {
	return (
		<Button
			data-close-sidebar
			variant="ghost"
			color="fg"
			size="sm"
			fontWeight="normal"
			borderRadius="xl"
			colorPalette="primary"
			w="full"

			{...props}
		>
			{props.children}
		</Button>
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
					<Popover.Content
						maxH="40rem"
						minW="18rem"
						p="3"
						ms="2.8rem"
						maxHeight="40dvh"
						overflowY="auto"
						css={{
							"&::-webkit-scrollbar": {
								width: "0.4rem",
							},
							"&::-webkit-scrollbar-thumb": {
								bg: "fg.subtle",
								borderRadius: "full",
							},
							"&::-webkit-scrollbar-track": {
								bg: "transparent",
							},
						}}
					>
						{children}
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	)
}


export function ChatList(props: ScrollAreaScrollbarProps) {
	const { pinnedChats } = useSidebar()

	return (
		<Scroller w="full" variant="always" {...props}>

			<VStack alignItems="start" gap="5" mb="5rem">
				{pinnedChats.length > 0 &&
					<Collapse
						title={
							<Text fontWeight="medium" fontSize="sm">
								Pinned
							</Text>
						}
						w="full"
					>
						<PinnedChats />
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
					<RecentChats />
				</Collapse>

			</VStack>

		</Scroller>
	)
}


export function RecentChats() {
	const {
		chatsQuery: {
			isLoading,
			hasNextPage,
			isFetchingNextPage,
			fetchNextPage,
		},
		recentChats: chats,
	} = useSidebar()


	const topRef = useRef<HTMLDivElement>(null) // Sentinel

	useEffect(() => {
		const element = topRef.current
		if (!element) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					hasNextPage &&
					!isFetchingNextPage
				) {
					fetchNextPage()
				}
			},
			{
				// Start loading before the user actually reaches the bottom.
				rootMargin: "0px 0px 500px 0px",
			}
		)

		observer.observe(element)

		return () => observer.disconnect()
	}, [
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	])


	return (
		<VStack>
			<ChatButtonList chats={chats} placeholder="No chats to list!" />

			{(isLoading || isFetchingNextPage) &&
				<>
					{Array.from({ length: 10 }, (_, i) => (
						<Skeleton w="full" key={i} height="8" borderRadius="xl" />
					))}
				</>
			}

			<Box ref={topRef} h="1px" />
		</VStack>
	)
}


export function PinnedChats() {
	const {
		pinnedChats: chats,
		chatsQuery: { isLoading }
	} = useSidebar()

	if (isLoading)
		return (
			<VStack flex="1">
				{Array.from({ length: 1 }, (_, i) => (
					<Skeleton w="full" key={i} height="8" borderRadius="xl" />
				))}
			</VStack>
		)

	if (chats.length === 0)
		return null

	return (
		<ChatButtonList chats={chats} placeholder="Pin chats to list them here." />
	)
}



export function ChatButtonList({ chats, placeholder }: { chats: AiChatRead[], placeholder?: string }) {
	return (
		<VStack w="full" alignItems="start" gap="0" mt="1">
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


export function ChatButton({ chat, ...props }: { chat: AiChatRead } & GroupProps) {
	const activeChat = useChatStore((s) => s.activeChat)
	const setActiveChat = useChatStore((s) => s.setActiveChat)
	const { update: { mutate: updateChat } } = useChatUpdateMutation()
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
				data-close-sidebar
				variant="plain"
				color="fg"
				size="sm"
				fontWeight="normal"
				justifyContent="start"
				borderRadius="xl"
				flex="1"
				colorPalette="primary"
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
					colorPalette="primary"
					variant="ghost"
					size="sm"
					borderRadius="xl"
					onClick={() => updateChat({ id: chat.id, pinned: !chat.pinned })}
				>
					{chat.pinned ? <LuPinOff /> : <LuPin />}
				</IconButton>

				<ChatButtonActionMenu
					chat={chat}
					open={menuOpen}
					onOpenChange={(e) => setMenuOpen(e.open)}
				>
					<IconButton
						colorPalette="primary"
						variant="ghost"
						size="sm"
						ms="auto"
						borderRadius="xl"
						focusRing="none"
					>
						<LuEllipsis />
					</IconButton>
				</ChatButtonActionMenu >
			</HStack>
		</Group>
	)
}

export function ChatButtonActionMenu({ chat, children, ...props }: { chat: AiChatRead } & MenuRootProps) {
	const { remove: { mutate: deleteChat } } = useChatRemoveMutation()

	return (
		<Menu.Root {...props}>
			<Menu.Trigger asChild>
				{children}
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.ItemGroup>
							<Menu.Item value="rename" cursor="pointer"><MdEdit />Rename</Menu.Item>
						</Menu.ItemGroup>
						<Menu.Separator />
						<Menu.ItemGroup>
							<Menu.Item
								value="delete"
								cursor="pointer"
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
