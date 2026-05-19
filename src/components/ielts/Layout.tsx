"use client";

import React, { useState } from "react";
import { Box, Flex, VStack, Tabs, HStack, Button, Collapsible, ButtonGroup, Icon } from "@chakra-ui/react";
import { QuestionNav } from "./QuestionNav";
import Navbar from "../common/Navbar";
import { ExamTimer } from "./ExamTimer";
import { useModuleStore } from "./ModuleProvider";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { TopBar } from "./TopBar";

type ViewPortProps = {
	title?: string | undefined
	children?: React.ReactNode;
};

function ViewPort({ children }: ViewPortProps) {
	return <>{children}</>;
}
ViewPort.displayName = "Layout.ViewPort";

type LayoutProps = {
	children: React.ReactNode;
};

type LayoutComponent = React.FC<LayoutProps> & {
	ViewPort: typeof ViewPort;
};

export const Layout: LayoutComponent = ({ children }) => {
	

	const panes = React.Children.toArray(children).filter(
		(child): child is React.ReactElement<ViewPortProps> =>
			React.isValidElement(child) &&
			(child.type as any).displayName === "Layout.ViewPort"
	);

	const [paneVisibility, setPaneVisibility] = useState(Array(panes.length).fill(true),)

	const togglePaneVisibility = (i: number) =>
		setPaneVisibility((prev) => {
			const next = [...prev];
			next[i] = !next[i];
			return next;
		});


	if (panes.length > 2) {
		throw new Error("Layout expects at most two <Layout.ViewPort> children.");
	}

	return (
		<VStack h="100dvh" gap={0} align="stretch" overflow="hidden">
			<TopBar />

			<Flex flex="1" minH="0" overflow="hidden">
				{
					panes.map((pane, i) => {
						if (!paneVisibility[i])
							return
						return (
							<Box key={pane.key} flex="1" minW="0" minH="0" overflowY="auto" overflowX="hidden">
								{pane.props.children}
							</Box>
						)
					})
				}
			</Flex>

			<Box flexShrink={0} py="3" px="6" w="full">
				<QuestionNav />
			</Box>
		</VStack>
	);
};

Layout.ViewPort = ViewPort;


/*
			<HStack borderBottom="sm" borderColor="fg.subtle">
				

				{panes.length > 1 && false && (
					<>
						<ButtonGroup mx="auto">
							{
								panes.map((pane, i) =>
									<Button
										variant="outline"
										size="sm"
										key={pane.key}
										onClick={() => togglePaneVisibility(i)}
									>
										<Icon>
											{paneVisibility[i] ? <MdVisibility /> : <MdVisibilityOff />}
										</Icon>
										{pane.props.title}
									</Button>)
							}
						</ButtonGroup>
					</>)
				}
			</HStack>
 */