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
import { useQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { LuSearch } from "react-icons/lu"
import { MdHistory } from "react-icons/md"
import { useDebounce } from "use-debounce"
import { search } from "@/client"
import { Dictionary } from "../dictionary/Dictionary"
import { WordNet } from "../dictionary/Wordnet"
import { useLangToolsStore } from "../lang-tools/LangToolsProvider"
import { CorpusPlayer } from "../media-corpus/CorpusPlayer"

export function LookupBody({ word }: { word: string }) {
	const [tab, setTab] = useState("dictionary")

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
			value={tab}
			onValueChange={(e) => setTab(e.value)}
		>
			<Tabs.List>
				<Tabs.Trigger value="dictionary">Dictionary</Tabs.Trigger>
				<Tabs.Trigger value="videos">Videos</Tabs.Trigger>
				<Tabs.Trigger value="wordnet">Wordnet</Tabs.Trigger>
			</Tabs.List>

			<Box flex="1" minH="0" pos="relative">
				<TabContent value="dictionary">
					<Dictionary headword={word} />
				</TabContent>

				<TabContent value="videos">
					<CorpusPlayer pause={tab!=="videos"} lemma={word} m="3" maxW="3xl" mx="auto"/>
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
			<ScrollArea.Root>
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
						{history.map((query) => (
							<Menu.Item key={query} value={query}>
								{query}
							</Menu.Item>
						))}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	)
}

type SearchInputProps = {
	onQuerySubmit: (query: string) => void
	defaultValue?: string | undefined
}

export function LookupInput({ onQuerySubmit, defaultValue }: SearchInputProps) {
	const [query, setQuery] = useState<string | undefined>(undefined)
	const [inputValue, setInputValue] = useState<string>(defaultValue ?? "")
	const [open, setOpen] = useState(false)

	const [debouncedQuery] = useDebounce(query, 300)

	const { data: headwords, isLoading } = useQuery({
		enabled: !!debouncedQuery,
		queryFn: () =>
			search({
				query: { q: debouncedQuery ?? "" },
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
		if (inputValue) onQuerySubmit(inputValue)
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
							{isLoading ? (
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
									{(headwords?.length ?? 0) > 0 ? (
										headwords?.map((headword) => (
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
