"use client"

import { VStack, HStack, Drawer, Portal, Stack, Box, Spacer } from "@chakra-ui/react"
import SidebarBody from "./SidebarBody";
import { LocaleSwitcher } from "@/i18n";
import ArrowButton from "./ArrowButton";
import { useState } from "react";
import { ColorModeButton } from "@/components/ui/color-mode";

const SIDEBAR_W = "60"          // Chakra space token -> 15rem
const NAV_H = "2.5lh"            // nav height

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

	const arrowButton = (
		<ArrowButton
			arrowDir={sidebarOpen}
			onClick={() => setSidebarOpen(!sidebarOpen)}
			variant="ghost"
			m="2"
			display={{ base: "block", md: "none" }}
		/>
	)

	return (

		<Box>
			{/* Sidebar */}
			<VStack
				as="aside"
				//w={sidebarOpen ? "60" : "20"}
				w={SIDEBAR_W}
				display={{ base: "none", md: "block" }}
				position="fixed"
				zIndex="20"
				borderEndWidth="1px"
			>
				<SidebarBody />
			</VStack>

			{/* Sidebar for mobile */}
			<Drawer.Root
				placement="start"
				size="xs"
				open={sidebarOpen}
			>
				<Portal>
					<Drawer.Backdrop />
					<Drawer.Positioner>
						<Drawer.Content>
							<Drawer.Body>
								<SidebarBody />
							</Drawer.Body>
							<Drawer.Footer>
							</Drawer.Footer>
							<Drawer.CloseTrigger asChild>
								{arrowButton}
							</Drawer.CloseTrigger>
						</Drawer.Content>
					</Drawer.Positioner>
				</Portal>
			</Drawer.Root>


			<Stack
				as="main"
				flex="1"
				h="100vh"
			>
				<Box
					position="fixed"
					ps={{ base: 0, md: SIDEBAR_W }}
					zIndex="10"
					w="full"
					bg="currentBg"
				>
					{/* Navbar */}
					<HStack
						as="nav"
						h={NAV_H}
						borderBottomWidth="1px"
					>
						{arrowButton}

						<Spacer />
						<LocaleSwitcher />
						<ColorModeButton me="3" />
					</HStack>
				</Box>

				{/* Body for each dashboard feature goes here */}
				<Box
					ms={{ base: 0, md: SIDEBAR_W }}
					mt={NAV_H}
					as="main"
					p="3"
				>
					{children}
				</Box>
			</Stack>

		</Box>
	)
}

