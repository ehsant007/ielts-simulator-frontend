"use client"

import { useLangToolsStore } from "../LangToolsProvider";
import { Text, Portal, FloatingPanel, IconButton, HStack, Spinner, Menu, Group, Tabs, Box, Input, ScrollArea, InputGroup, Popover, Button, VStack } from "@chakra-ui/react";
import { WordNet } from "./Wordnet";
import { LuMaximize2, LuMinus, LuSearch, LuSquare, LuX } from "react-icons/lu";
import { MdHistory, MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { Suspense, useState } from "react";
import { Dictionary } from "./Dictionary";
import { useQuery } from "@tanstack/react-query";
import { search } from "@/client";
import { useDebounce } from "use-debounce"

export function Browser() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	const minSize = { width: 620, height: 400 }
	const [size, setSize] = useState({ width: 800, height: 600 })
	const [position, setPosition] = useState<{ x: number, y: number } | undefined>(undefined)

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

	if (!word)
		return null

	return (
		<FloatingPanel.Root
			open={isOpen}
			onOpenChange={(details) => !details.open && close()}
			defaultSize={size}
			minSize={minSize}
			onSizeChange={(e) => setSize(e.size)}
			position={position}
			onPositionChange={(e) => setPosition(e.position)}
		>
			<Portal>
				<FloatingPanel.Positioner>
					<FloatingPanel.Content
						display="flex"
						flexDir="column"
						overflow="hidden"
						border="sm"
						borderColor="fg.subtle"
						shadow="md"
					>
						<FloatingPanel.Header>
							<Group gap="1">
								<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1" disabled={!previous} onClick={() => setWordQuery(previous ?? null, false)}>
									<MdOutlineArrowBack />
								</IconButton>
								<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1" disabled={!next} onClick={() => setWordQuery(next ?? null, false)}>
									<MdOutlineArrowForward />
								</IconButton>
							</Group>

							<HistoryMenu />

							<SearchInput key={word} defaultValue={word} onQuerySubmit={(query) => setWordQuery(query)} />

							<FloatingPanel.DragTrigger h="full">
								{/* <LuGripHorizontal /> */}
								<FloatingPanel.Title>

								</FloatingPanel.Title>

							</FloatingPanel.DragTrigger>

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

						<FloatingPanel.Body display="flex" flexDir="column" minH="0" flex="1" p="0">

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
			<ScrollArea.Root>
				<ScrollArea.Viewport>
					<ScrollArea.Content spaceY="4" textStyle="sm">
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
							<Box h="10%"></Box>
						</Suspense>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar>
					<ScrollArea.Thumb />
				</ScrollArea.Scrollbar>
				<ScrollArea.Corner />
			</ScrollArea.Root>
		</Tabs.Content>
	)
}

function BrowserTabs({ word }: { word: string }) {
	return (
		<Tabs.Root
			display="flex"
			flexDir="column"
			flex="1"
			minH="0"
			w="full"
			defaultValue="dictionary"
			size="sm"
		>
			<Tabs.List>

				<Tabs.Trigger value="dictionary">
					Dictionary
				</Tabs.Trigger>

				<Tabs.Trigger value="wordnet">
					Wordnet
				</Tabs.Trigger>

			</Tabs.List>

			<Box flex="1" minH="0" pos="relative">

				<TabContent value="wordnet">
					<WordNet headword={word} />
				</TabContent>

				<TabContent value="dictionary">
					<Dictionary headword={word} />
				</TabContent>

			</Box>
		</Tabs.Root>
	)
}



function HistoryMenu() {
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	return (
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
	)
}


type SearchInputProps = {
	onQuerySubmit: (query: string) => void,
	defaultValue?: string | undefined,
}

function SearchInput({ onQuerySubmit, defaultValue }: SearchInputProps) {
	const [query, setQuery] = useState<string | undefined>(undefined)
	const [inputValue, setInputValue] = useState<string>(defaultValue ?? "")
	const [open, setOpen] = useState(false)

	const [debouncedQuery] = useDebounce(query, 300)

	const { data: headwords, isLoading } = useQuery({
		enabled: !!debouncedQuery,
		queryFn: () => search({
			query: { q: debouncedQuery! },
		}).then((res) => res.data.headwords),
		queryKey: ["dictionary-search", debouncedQuery],
	})

	const handleInputChange = (value: string) => {
		setInputValue(value)
		setQuery(value)
		setOpen(!!value)
	}

	const handleSelect = (value: string) => {
		setInputValue(value)
		setOpen(false)
		onQuerySubmit(value)
	}

	const submitInputValue = () => {
		setOpen(false)
		if (inputValue)
			onQuerySubmit(inputValue)
	}

	return (
		<Popover.Root
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			// positioning={{ offset: { crossAxis: 0, mainAxis: 0 } }}
			autoFocus={false}
		>

			<Popover.Anchor asChild>
				<InputGroup
					width="40ch"
					//flex="1"
					endElement={
						<IconButton
							position="relative"
							onClick={submitInputValue}
							minW="unset"
							h="auto"
							p="1"
							variant="ghost"
						>
							<LuSearch />
						</IconButton>
					}
				>
					<Input
						value={inputValue}
						onChange={(e) => handleInputChange(e.currentTarget.value)}
						onClick={(e) => handleInputChange(e.currentTarget.value)}
						onKeyDown={(e) => { if (e.key === "Enter") submitInputValue() }}
						placeholder="Search dictionary"
						borderRadius="none"
					/>
				</InputGroup>
			</Popover.Anchor>

			<Portal>
				<Popover.Positioner>
					<Popover.Content zIndex="max" borderRadius="none" minW="var(--reference-width)" width="fit-content">
						<Popover.Body>

							{isLoading ?
								<HStack gap="3" bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4" width="min" mx="auto">
									<Spinner size="sm" colorPalette="blue" />
									<Text fontSize="sm" color="fg.muted">
										Loading...
									</Text>
								</HStack>

								:

								<VStack alignItems="start" gap="0">
									{headwords?.length ?? 0 > 0 ?
										<>
											{headwords?.map((headword) => (
												<Button
													variant="ghost"
													borderRadius="none"
													key={headword}
													onClick={() => handleSelect(headword)}
													w="full"
													justifyContent="start"
													size="sm"
												>
													{headword}
												</Button>
											))}
										</> :
										<Text>No entries found!</Text>
									}
								</VStack>
							}

						</Popover.Body>
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	)
}
