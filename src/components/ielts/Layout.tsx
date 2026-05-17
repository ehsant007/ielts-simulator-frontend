"use client";

import React from "react";
import { Box, Flex, VStack, Tabs } from "@chakra-ui/react";
import { QuestionNav } from "./QuestionNav";
import Navbar from "../common/Navbar";

type ViewPortProps = {
	children?: React.ReactNode;
};

function ViewPort({ children }: ViewPortProps) {
	return <>{children}</>;
}
ViewPort.displayName = "Layout.ViewPort";

type LayoutProps = {
	sectionTitles?: string[] | undefined;
	children: React.ReactNode;
};

type LayoutComponent = React.FC<LayoutProps> & {
	ViewPort: typeof ViewPort;
};

export const Layout: LayoutComponent = ({ children, sectionTitles }) => {
	const panes = React.Children.toArray(children).filter(
		(child): child is React.ReactElement<ViewPortProps> =>
			React.isValidElement(child) &&
			(child.type as any).displayName === "Layout.ViewPort"
	);

	if (panes.length > 2) {
		throw new Error("Layout expects at most two <Layout.ViewPort> children.");
	}

	return (
		<VStack h="100dvh" gap={0} align="stretch" overflow="hidden">
			<Navbar />

			<Flex flex="1" minH="0" overflow="hidden">
				<Tabs.Root defaultValue="both" h="full" w="full">
					<Flex direction="column" h="full" minH="0" overflow="hidden">
						{sectionTitles &&
							<Tabs.List flexShrink={0}>
								<Tabs.Trigger value="pane0" ms="auto">{sectionTitles[0]}</Tabs.Trigger>
								<Tabs.Trigger value="both">{sectionTitles[1]}</Tabs.Trigger>
								<Tabs.Trigger value="pane1" me="auto">{sectionTitles[2]}</Tabs.Trigger>
							</Tabs.List>
						}

						<Box flex="1" minH="0" overflow="hidden">

							<Tabs.Content value="pane0" h="full" m={0} p={0}>
								<Box h="full" minH="0" overflowY="auto" overflowX="hidden">
									{panes[0]?.props.children}
								</Box>
							</Tabs.Content>

							<Tabs.Content value="both" h="full" m={0} p={0}>
								<Flex h="full" minH="0" gap={0} overflow="hidden">
									<Box flex="1" minW="0" minH="0" overflowY="auto" overflowX="hidden">
										{panes[0]?.props.children}
									</Box>
									<Box flex="1" minW="0" minH="0" overflowY="auto" overflowX="hidden">
										{panes[1]?.props.children}
									</Box>
								</Flex>
							</Tabs.Content>

							<Tabs.Content value="pane1" h="full" m={0} p={0}>
								<Box h="full" minH="0" overflowY="auto" overflowX="hidden">
									{panes[1]?.props.children}
								</Box>
							</Tabs.Content>

						</Box>

					</Flex>
				</Tabs.Root>
			</Flex>

			<Box flexShrink={0} py="3" px="6" w="full">
				<QuestionNav />
			</Box>
		</VStack>
	);
};

Layout.ViewPort = ViewPort;