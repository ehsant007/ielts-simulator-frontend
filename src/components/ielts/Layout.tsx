"use client";

import React, { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Flex, HStack, Icon, SegmentGroup, useBreakpoint, useBreakpointValue, VStack } from "@chakra-ui/react";
import { QuestionNav } from "./QuestionNav";
import { TopBar } from "./TopBar";
import { MdDoubleArrow, MdSwitchLeft, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { AnimatePresence, motion } from "motion/react"
import { BiCollapse, BiExpand } from "react-icons/bi";
import { GoArrowSwitch } from "react-icons/go";

const MotionBox = motion.create(Box)

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

	const [paneVisibility, _setPaneVisibility] = useState(Array(panes.length).fill(true),)
	const scrollPosition = useRef<Array<number>>(Array(panes.length).fill(0))

	const isMobile = useBreakpointValue({ base: true, md: false, })

	const setPaneVisibility = (i: number, visibility: boolean) =>
		_setPaneVisibility((prev) => {
			const next = [...prev];
			next[i] = visibility;
			return next;
		});

	const toggleExpand = (pane_i: number) => {
		for (let i = 0; i < panes.length; i++)
			setPaneVisibility(i, !paneVisibility[i] || pane_i === i)
	}

	const expand = (pane_i: number) => {
		for (let i = 0; i < panes.length; i++)
			setPaneVisibility(i, pane_i === i)
	}

	const [paneSwitch, setPaneSwitch] = useState(isMobile ? () => { expand(0); return "left" } : "both")


	if (panes.length > 2) {
		throw new Error("Layout expects at most two <Layout.ViewPort> children.");
	}


	return (
		<VStack h="100dvh" gap={0} overflow="hidden">
			<TopBar />

			{panes.length > 1 &&
				<SegmentGroup.Root
					mx="auto"
					value={paneSwitch}
					size="xs"
					mb="0.5"
					css={{
						"--segment-indicator-bg": "colors.purple.muted",
					}}
				>
					<SegmentGroup.Indicator/>

					<SegmentGroup.Item
						cursor="pointer"
						value="left"
						onClick={() => {
							expand(0)
							setPaneSwitch("left")
						}}
						fontWeight="semibold"
					>
						{panes[0].props.title}
					</SegmentGroup.Item>

					{!isMobile &&
						<SegmentGroup.Item
							cursor="pointer"
							value="both"
							onClick={() => {
								setPaneVisibility(0, true)
								setPaneVisibility(1, true)
								setPaneSwitch("both")
							}}
							fontWeight="semibold"
						>
							Both
						</SegmentGroup.Item>
					}

					<SegmentGroup.Item
						cursor="pointer"
						value="right"
						onClick={() => {
							expand(1)
							setPaneSwitch("right")
						}}
						fontWeight="semibold"
					>
						{panes[1].props.title}
					</SegmentGroup.Item>


				</SegmentGroup.Root>
			}


			<Flex flex="1" minH="0" overflow="hidden" w="full">
				<AnimatePresence initial={false} mode="popLayout">
					{panes.map((pane, i) =>
						paneVisibility[i] ? (
							<Pane
								key={pane.key}
								scroll={scrollPosition.current[i]}
								onScroll={(value) => scrollPosition.current[i] = value}
								onAction={() => toggleExpand(i)}
							>
								{pane.props.children}
							</Pane>
						) : null
					)}
				</AnimatePresence>
			</Flex>

			<Box flexShrink={0} py="3" px="6" w="full">
				<QuestionNav />
			</Box>
		</VStack>
	);
};

Layout.ViewPort = ViewPort;


const Pane = forwardRef<HTMLDivElement, { children: React.ReactNode, scroll: number, onScroll: (value: number) => void, onAction: () => void }>(
	function Pane({ children, scroll, onScroll, onAction }, forwardRef) {
		const ref = useRef<HTMLDivElement>(null)
		const [navExpand, setNavExpand] = useState(false)

		useLayoutEffect(() => {
			if (!ref.current) return
			ref.current.scrollTop = scroll
		}, [scroll])

		const setRef = (el: HTMLDivElement) => {
			ref.current = el

			if (typeof forwardRef === "function")
				forwardRef(el)
			else if (forwardRef)
				forwardRef.current = el
		}

		return (
			<MotionBox
				ref={setRef}
				bg="bg"
				layout
				flex="1"
				minW="0"
				minH="0"
				overflowY="auto"
				overflowX="hidden"
				exit={{ opacity: 0, scaleX: 0.98 }}
				transition={{ duration: 0.2 }}
				onScroll={(e) => (onScroll(e.currentTarget.scrollTop))}
			>
				{children}

			</MotionBox>
		)
	}
)