"use client"

import { FloatingPanel, Group, IconButton, Portal } from "@chakra-ui/react"
import { useState } from "react"
import { LuMaximize2, LuMinus, LuSquare, LuX } from "react-icons/lu"
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md"
import { useLangToolsStore } from "../lang-tools/LangToolsProvider"
import { LookupBody, LookupHistoryMenu, SearchInput } from "./LookupBody"
import { LookupProvider } from "./LookupProvider"

export function LookupFloating() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	const minSize = { width: 620, height: 400 }
	const [size, setSize] = useState({ width: 800, height: 900 })
	const [position, setPosition] = useState<{ x: number; y: number } | undefined>(undefined)

	const isOpen = Boolean(word)
	const close = () => setWordQuery(null)

	const currentIndex = word ? history.indexOf(word) : -1

	const previous = currentIndex >= 0 && currentIndex + 1 < history.length ? history[currentIndex + 1] : undefined

	const next = currentIndex > 0 ? history[currentIndex - 1] : undefined

	if (!word) return null

	return (
		<LookupProvider>
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
									<IconButton
										variant="ghost"
										minW="unset"
										h="auto"
										w="auto"
										p="1"
										disabled={!previous}
										onClick={() => setWordQuery(previous ?? null, false)}
									>
										<MdOutlineArrowBack />
									</IconButton>
									<IconButton
										variant="ghost"
										minW="unset"
										h="auto"
										w="auto"
										p="1"
										disabled={!next}
										onClick={() => setWordQuery(next ?? null, false)}
									>
										<MdOutlineArrowForward />
									</IconButton>
								</Group>

								<LookupHistoryMenu />

								<SearchInput
									key={word}
									defaultValue={word}
									onQuerySubmit={(query) => setWordQuery(typeof query === "object" ? query.text : query)}
								/>

								<FloatingPanel.DragTrigger h="full">
									{/* <LuGripHorizontal /> */}
									<FloatingPanel.Title></FloatingPanel.Title>
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
								<LookupBody word={word} />
							</FloatingPanel.Body>

							<FloatingPanel.ResizeTriggers />
						</FloatingPanel.Content>
					</FloatingPanel.Positioner>
				</Portal>
			</FloatingPanel.Root>
		</LookupProvider>
	)
}
