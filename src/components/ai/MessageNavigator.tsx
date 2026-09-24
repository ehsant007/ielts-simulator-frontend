import { useRef, useState } from "react"
import { Button, Menu, Portal, Flex, Spinner, Center } from "@chakra-ui/react"
import { useMessagesQuery } from "./hooks"
import { RiMenu3Line } from "react-icons/ri"

export function MessageNavigator({ chatId }: { chatId: string }) {
	const { messages, isLoading } = useMessagesQuery(chatId)

	const [open, setOpen] = useState(false)
	const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const userMessages = messages.filter((msg) => msg.role === "user")

	const showMenu = () => {
		if (closeTimeout.current) {
			clearTimeout(closeTimeout.current)
		}
		setOpen(true)
	}

	const hideMenu = () => {
		closeTimeout.current = setTimeout(() => {
			setOpen(false)
		}, 100)
	}

	return (
		<Menu.Root
			open={open}
			onOpenChange={(details) => setOpen(details.open)}
			positioning={{
				placement: "left",
				strategy: "fixed",
				offset: {
					mainAxis: -20,
				},
			}}
		>
			<Menu.Trigger asChild>
				<Button
					variant="plain"
					size="md"
					onPointerEnter={showMenu}
					onPointerLeave={hideMenu}
					border="none"
					focusRing="none"
					h="auto"
					minW="0"
					p="0"
					m="0"
					_open={{
						bg: "colorPalette.subtle",
					}}
				>
					<Flex flexDir="column" color="fg.subtle">
						<RiMenu3Line />
						<RiMenu3Line />
						<RiMenu3Line />
					</Flex>
				</Button>
			</Menu.Trigger>

			<Portal>
				<Menu.Positioner
					onPointerEnter={showMenu}
					onPointerLeave={hideMenu}
				>
					<Menu.Content
						maxH="70dvh"
						overflowY="auto"
						borderRadius="xl"
						p="4"
						minW="30ch"
					>
						{isLoading
							?
							<Center>
								<Spinner size="xl" color="primary" borderWidth="thick" />
							</Center>
							:
							<>
								{userMessages.map((msg) => (
									<Menu.Item
										key={msg.id}
										value={msg.id}
										cursor="pointer"
										_hover={{ bg: "primary.muted" }}
										onSelect={() => {
											const msgElement = document.getElementById(msg.id)
											if(msgElement == null)
												return
											msgElement.style.setProperty("scroll-margin-top", "1rem")
											msgElement?.scrollIntoView({
												behavior: "smooth",
												block: "start",
											})
										}}
									>
										{msg.content.slice(0, 40)}
									</Menu.Item>
								))}
							</>
						}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	)
}

