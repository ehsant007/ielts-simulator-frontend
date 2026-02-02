"use client"

import { VStack, Portal, Drawer } from "@chakra-ui/react"
import { useState, ReactNode } from "react";
import SidebarBody from "./SidebarBody";
import ArrowButton from "./ArrowButton";

type SidebarProps = {
	closeButton: ReactNode,
};

export default function Sidebar({closeButton}: SidebarProps) {

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
		<>
			<VStack
				as="aside"
				//w={sidebarOpen ? "60" : "20"}
				w="60"
				bg="purple"
				display={{ base: "none", md: "block" }}
			>
				<SidebarBody />
			</VStack>

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
		</>
	)
}