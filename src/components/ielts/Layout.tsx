"use client";

import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
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
	const scrollPosition = useRef<Map<string, number>>(new Map<string, number>())

	const isMobile = useBreakpointValue({ base: true, md: false, })

	const setPaneVisibility = (i: number, visibility: boolean) =>
		_setPaneVisibility((prev) => {
			const next = [...prev];
			next[i] = visibility;
			return next;
		});


	const expand = (pane_i: number) => {
		for (let i = 0; i < panes.length; i++)
			setPaneVisibility(i, pane_i === i)
	}

	const [mode, setMode] = useState("both")

	const changeMode = (value: string) => {
		switch (value) {
			case "left":
				expand(0)
				setMode("left")
				break
			case "right":
				expand(1)
				setMode("right")
				break
			case "both":
				setPaneVisibility(0, true)
				setPaneVisibility(1, true)
				setMode("both")
				break
		}
	}

	useEffect(() => {
		if (isMobile)
		{
			if (mode === "both")
				changeMode("left")
		}
		else
			changeMode("both")

	}, [isMobile])

	if (panes.length > 2) {
		throw new Error("Layout expects at most two <Layout.ViewPort> children.");
	}


	return (
		<VStack h="100dvh" gap={0} overflow="hidden">
			<TopBar />

			{panes.length > 1 &&
				<SegmentGroup.Root
					mx="auto"
					value={mode}
					size="xs"
					mb="0.5"
					css={{
						"--segment-indicator-bg": "colors.purple.muted",
					}}
				>
					<SegmentGroup.Indicator />

					<SegmentGroup.Item
						cursor="pointer"
						value="left"
						onClick={() => changeMode("left")}
						fontWeight="semibold"
					>
						{panes[0].props.title}
					</SegmentGroup.Item>

					{!isMobile &&
						<SegmentGroup.Item
							cursor="pointer"
							value="both"
							onClick={() => changeMode("both")}
							fontWeight="semibold"
						>
							Both
						</SegmentGroup.Item>
					}

					<SegmentGroup.Item
						cursor="pointer"
						value="right"
						onClick={() => changeMode("right")}
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
								scroll={scrollPosition.current.get(pane.key ?? "nokey") ?? 0}
								onScroll={(value) => scrollPosition.current.set(pane.key ?? "nokey", value)}
								align={mode === "both" ? ["end", "start"][i] : "center"}
							>
								{pane.props.children}
							</Pane>
						) : null
					)}
				</AnimatePresence>
			</Flex>

			<Box
				flexShrink={0}
				pb="3"
				pt="1"
				px="6"
				w="full"
			>
				<QuestionNav />
			</Box>
		</VStack>
	);
};

Layout.ViewPort = ViewPort;


const Pane = forwardRef<HTMLDivElement, { children: React.ReactNode, scroll: number, onScroll: (value: number) => void, align: string }>(
	function Pane({ children, scroll, onScroll, align }, forwardRef) {
		const ref = useRef<HTMLDivElement>(null)

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
				<Box maxW="5xl" w="full" justifySelf={align}>
					{children}
				</Box>

			</MotionBox>
		)
	}
)