"use client"

import { useLangToolsStore } from "../LangToolsProvider";
import { Text, Portal, FloatingPanel, IconButton, HStack, Spinner, Menu, Group, Tabs, Box, Input } from "@chakra-ui/react";
import { WordNet } from "./Wordnet";
import { LuMaximize2, LuMinus, LuSquare, LuX } from "react-icons/lu";
import { MdHistory, MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { Suspense } from "react";
import { Dictionary } from "./Dictionary";

export function Browser() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	const isOpen = Boolean(word)
	const close = () => setWordQuery(null)

	const currentIndex = word ? history.indexOf(word) : -1;

	const previous =
		currentIndex >= 0 && currentIndex + 1 < history.length
			? history[currentIndex + 1]
			: undefined;

	const next =
		currentIndex > 0
			? history[currentIndex - 1]
			: undefined;

	const minSize = { width: 520, height: 400 };

	if (!word)
		return null


	return (
		<FloatingPanel.Root
			open={isOpen}
			onOpenChange={(details) => !details.open && close()}
			defaultSize={minSize}
			minSize={minSize}
		>
			<Portal>
				<FloatingPanel.Positioner>
					<FloatingPanel.Content border="sm" borderColor="fg.subtle" shadow="md">
						<FloatingPanel.Header>
							<Group gap="1">
								<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1" disabled={!previous} onClick={() => setWordQuery(previous ?? null, false)}>
									<MdOutlineArrowBack />
								</IconButton>
								<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1" disabled={!next} onClick={() => setWordQuery(next ?? null, false)}>
									<MdOutlineArrowForward />
								</IconButton>
							</Group>
							<Input value={word} w="30ch" onChange={(e) => setWordQuery(e.currentTarget.value)} mx="auto" />
							<FloatingPanel.DragTrigger>
								{/* <LuGripHorizontal /> */}
								<FloatingPanel.Title>

									...
								</FloatingPanel.Title>

							</FloatingPanel.DragTrigger>


							<Menu.Root onSelect={(e) => setWordQuery(e.value)}>
								<Menu.Trigger asChild>
									<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1">
										<MdHistory />
									</IconButton>
								</Menu.Trigger>

								<Portal>
									<Menu.Positioner>
										<Menu.Content zIndex="max">
											{history.map((query, i) =>
												<Menu.Item key={i} value={query}>
													{query}
												</Menu.Item>
											)}
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>

							<FloatingPanel.Control>
								<FloatingPanel.StageTrigger stage="minimized" asChild>
									<IconButton variant="ghost" size="2xs">
										<LuMinus />
									</IconButton>
								</FloatingPanel.StageTrigger>
								<FloatingPanel.StageTrigger stage="maximized" asChild>
									<IconButton variant="ghost" size="2xs">
										<LuSquare />
									</IconButton>
								</FloatingPanel.StageTrigger>
								<FloatingPanel.StageTrigger stage="default" asChild>
									<IconButton variant="ghost" size="2xs">
										<LuMaximize2 />
									</IconButton>
								</FloatingPanel.StageTrigger>
								<FloatingPanel.CloseTrigger asChild>
									<IconButton variant="ghost" size="2xs">
										<LuX />
									</IconButton>
								</FloatingPanel.CloseTrigger>
							</FloatingPanel.Control>
						</FloatingPanel.Header>
						<FloatingPanel.Body p="0">

							<BrowserTabs word={word} />

						</FloatingPanel.Body>
						<FloatingPanel.ResizeTriggers />
					</FloatingPanel.Content>
				</FloatingPanel.Positioner>
			</Portal>
		</FloatingPanel.Root>
	)
}



function TabContent({ children, value }: { children: React.ReactNode, value: string }) {
	return (
		<Tabs.Content
			p="0"
			value={value}
			position="absolute"
			inset="0"
			_open={{
				animationName: "fade-in, scale-in",
				animationDuration: "300ms",
			}}
			_closed={{
				animationName: "fade-out, scale-out",
				animationDuration: "120ms",
			}}
		>
			<Suspense
				fallback={
					<HStack gap="3" bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4" width="min" mx="auto">
						<Spinner size="sm" colorPalette="blue" />
						<Text fontSize="sm" color="fg.muted">
							Loading...
						</Text>
					</HStack>
				}
			>
				{children}
			</Suspense>
		</Tabs.Content>
	)
}

function BrowserTabs({ word }: { word: string }) {
	return (
		<Tabs.Root defaultValue="dictionary" width="full" size="sm">
			<Tabs.List>

				<Tabs.Trigger value="dictionary">
					Dictionary
				</Tabs.Trigger>

				<Tabs.Trigger value="wordnet">
					Wordnet
				</Tabs.Trigger>

			</Tabs.List>

			<Box pos="relative" width="full">

				<TabContent value="wordnet">
					<WordNet word={word} />
				</TabContent>

				<TabContent value="dictionary">
					<Dictionary headword={word} />
				</TabContent>

			</Box>
		</Tabs.Root>
	)
}

