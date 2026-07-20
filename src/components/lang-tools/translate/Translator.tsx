"use client"

import { useLangToolsStore } from "../LangToolsProvider";
import { Text, Portal, FloatingPanel, IconButton, AbsoluteCenter, HStack, Spinner, Menu, Group } from "@chakra-ui/react";
import { WordNet } from "./Wordnet";
import { LuGripHorizontal, LuMaximize2, LuMinus, LuSquare, LuX } from "react-icons/lu";
import { MdHistory, MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { Suspense } from "react";
import { BsBack, BsForward } from "react-icons/bs";
import { FaBackward } from "react-icons/fa6";
import { ImBackward } from "react-icons/im";

export function Translator() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	const sortedHistory = [...history.entries()].sort((a, b) => b[1] - a[1])

	const isOpen = Boolean(word)
	const close = () => setWordQuery(null)

	if (!word)
		return null

	return (
		<FloatingPanel.Root
			open={isOpen}
			onOpenChange={(details) => !details.open && close()}
			minSize={{ width: 320, height: 200 }}
		>
			<Portal>
				<FloatingPanel.Positioner>
					<FloatingPanel.Content border="sm" borderColor="fg.subtle" shadow="md">
						<FloatingPanel.Header>
							<FloatingPanel.DragTrigger>
								{/* <LuGripHorizontal /> */}
								<FloatingPanel.Title>
									<Group gap="1">
										<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1">
											<MdOutlineArrowBack />
										</IconButton>
										<IconButton variant="ghost" minW="unset" h="auto" w="auto" p="1">
											<MdOutlineArrowForward />
										</IconButton>
									</Group>
									
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
											{sortedHistory.map(([query], i) =>
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
						<FloatingPanel.Body p="6">

							<Suspense
								fallback={
									<AbsoluteCenter bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4">
										<HStack gap="3">
											<Spinner size="sm" colorPalette="blue" />
											<Text fontSize="sm" color="fg.muted">
												Loading...
											</Text>
										</HStack>
									</AbsoluteCenter>
								}
							>
								<WordNet word={word} />
							</Suspense>

						</FloatingPanel.Body>
						<FloatingPanel.ResizeTriggers />
					</FloatingPanel.Content>
				</FloatingPanel.Positioner>
			</Portal>
		</FloatingPanel.Root>
	)
}