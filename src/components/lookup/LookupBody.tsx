import {
	Box,
	Button,
	HStack,
	IconButton,
	Input,
	InputGroup,
	Menu,
	Popover,
	Portal,
	ScrollArea,
	Spinner,
	Tabs,
	Text,
	VStack,
} from "@chakra-ui/react"

import { Suspense, useEffect, useState } from "react"
import { LuSearch } from "react-icons/lu"
import { MdHistory } from "react-icons/md"
import { useDebounce } from "use-debounce"
import { Dictionary } from "../dictionary/Dictionary"
import { useDictionaryHistory } from "../dictionary/hooks"
import { WordNet } from "../dictionary/Wordnet"
import { useLangToolsStore } from "../lang-tools/LangToolsProvider"
import { CorpusPlayer } from "../media-corpus/CorpusPlayer"
import { useSearch } from "./hooks"
import { useLookupContext } from "./LookupProvider"
import type { LookupMethod, SearchResultItem } from "./types"

export function LookupBody({ word }: { word: string }) {
	const { lookupMethod, setLookupMethod } = useLookupContext()

	return (
		<Tabs.Root
			lazyMount
			display="flex"
			flexDir="column"
			flex="1"
			minH="0"
			w="full"
			defaultValue="dictionary"
			size="sm"
			value={lookupMethod}
			onValueChange={(e) => setLookupMethod(e.value as LookupMethod)}
		>
			<Tabs.List>
				<Tabs.Trigger value="dictionary">Dictionary</Tabs.Trigger>
				<Tabs.Trigger value="corpus">Videos</Tabs.Trigger>
				<Tabs.Trigger value="wordnet">Wordnet</Tabs.Trigger>
			</Tabs.List>

			<Box flex="1" minH="0" pos="relative">
				<TabContent value="dictionary">
					<Dictionary headword={word} />
				</TabContent>

				<TabContent value="corpus">
					<CorpusPlayer
						pause={lookupMethod !== "corpus"}
						lemma={word}
						m="3"
						maxW="3xl"
						mx="auto"
					/>
				</TabContent>

				<TabContent value="wordnet">
					<WordNet headword={word} />
				</TabContent>
			</Box>
		</Tabs.Root>
	)
}

function TabContent({
	children,
	value,
}: {
	children: React.ReactNode
	value: string
}) {
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
			<ScrollArea.Root size="lg">
				<ScrollArea.Viewport>
					<ScrollArea.Content spaceY="4" textStyle="sm">
						<Suspense
							fallback={
								<HStack
									gap="3"
									bg="bg/80"
									backdropFilter="blur(2px)"
									rounded="md"
									p="4"
									width="min"
									mx="auto"
								>
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

export function LookupHistoryMenu() {
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)

	const { history, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useDictionaryHistory()

	const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!sentinel) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{ rootMargin: "0px 0px 20px 0px" },
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [sentinel, hasNextPage, isFetchingNextPage, fetchNextPage])

	return (
		<Menu.Root onSelect={(e) => setWordQuery(e.value)}>
			<Menu.Trigger asChild>
				<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1">
					<MdHistory />
				</IconButton>
			</Menu.Trigger>

			<Portal>
				<Menu.Positioner>
					<Menu.Content
						minW="9rem"
						maxHeight="40dvh"
						overflowY="auto"
						css={{
							"&::-webkit-scrollbar": {
								width: "0.4rem",
							},
							"&::-webkit-scrollbar-thumb": {
								bg: "fg.subtle",
								borderRadius: "full",
							},
							"&::-webkit-scrollbar-track": {
								bg: "transparent",
							},
						}}
					>
						{history.map((query) => (
							<Menu.Item key={query} value={query}>
								{query}
							</Menu.Item>
						))}

						<Box ref={setSentinel} h="1px" />
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	)
}

export type SearchInputProps = {
	onQuerySubmit: (result: string | SearchResultItem) => void
	defaultValue?: string | undefined
}

export function SearchInput({ onQuerySubmit, defaultValue }: SearchInputProps) {
	const { lookupMethod } = useLookupContext()
	const [inputValue, setInputValue] = useState<string>(defaultValue ?? "")
	const [open, setOpen] = useState(false)

	const [debounced] = useDebounce(inputValue, 300)
	const { searchResult, isSearchLoading } = useSearch(lookupMethod, debounced)

	const handleInputChange = (value: string) => {
		setInputValue(value)
		setOpen(!!value)
	}

	const handleSelect = (result: SearchResultItem) => {
		setInputValue(result.text)
		setOpen(false)
		onQuerySubmit(result)
	}

	const submitInputValue = () => {
		setOpen(false)
		if (inputValue) {
			onQuerySubmit(inputValue)
		}
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
						onKeyDown={(e) => {
							if (e.key === "Enter") submitInputValue()
						}}
						placeholder="Search dictionary"
						borderRadius="none"
					/>
				</InputGroup>
			</Popover.Anchor>

			<Portal>
				<Popover.Positioner>
					<Popover.Content
						zIndex="max"
						borderRadius="none"
						minW="var(--reference-width)"
						width="fit-content"
					>
						<Popover.Body>
							{isSearchLoading ? (
								<HStack
									gap="3"
									bg="bg/80"
									backdropFilter="blur(2px)"
									rounded="md"
									p="4"
									width="min"
									mx="auto"
								>
									<Spinner size="sm" colorPalette="blue" />
									<Text fontSize="sm" color="fg.muted">
										Loading...
									</Text>
								</HStack>
							) : (
								<VStack alignItems="start" gap="0">
									{(searchResult?.length ?? 0) > 0 ? (
										searchResult?.map((res) => (
											<Button
												variant="ghost"
												borderRadius="none"
												key={res.id}
												onClick={() => handleSelect(res)}
												w="full"
												justifyContent="start"
												size="sm"
											>
												{res.text}
												<Text as="span" color="fg.subtle" fontWeight="normal">
													{res.partOfSpeech}
												</Text>
											</Button>
										))
									) : (
										<Text>No entries found!</Text>
									)}
								</VStack>
							)}
						</Popover.Body>
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	)
}
