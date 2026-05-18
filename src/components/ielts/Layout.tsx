"use client";

import React, { useState } from "react";
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

				<Box flex="1" minW="0" minH="0" overflowY="auto" overflowX="hidden">
					{panes[0]?.props.children}
				</Box>

				{panes[1] &&
					<Box flex="1" minW="0" minH="0" overflowY="auto" overflowX="hidden">
						{panes[1]?.props.children}
					</Box>
				}

			</Flex>

			<Box flexShrink={0} py="3" px="6" w="full">
				<QuestionNav />
			</Box>
		</VStack>
	);
};

Layout.ViewPort = ViewPort;