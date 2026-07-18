"use client"

import { useLangToolsStore } from "../LangToolsProvider";
import { readWordnet } from "@/client";
import { Text, Portal, FloatingPanel, IconButton, AbsoluteCenter, HStack, Spinner, Menu } from "@chakra-ui/react";
import { WordNetResult } from "./WordNetResult";
import { LuGripHorizontal, LuMaximize2, LuMinus, LuSquare, LuX } from "react-icons/lu";
import { AdvText } from "../AdvText";
import { MdHistory } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

export function WordNet() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const history = useLangToolsStore((state) => state.translateHistory)

	const sortedHistory = [...history.entries()].sort((a, b) => b[1] - a[1])

	const { data: result, isLoading } = useQuery({
		enabled: Boolean(word),
		queryFn: () => readWordnet({
			path: { word: word! },
		}).then((res) => res.data)
		,
		queryKey: ["wordnet", word],
	})

	const isOpen = Boolean(word)
	const close = () => setWordQuery(null)

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
								<LuGripHorizontal />
								<FloatingPanel.Title>
									{word}
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
							{!isLoading ?
								result ?
									< WordNetResult data={result} />
									:
									<AbsoluteCenter>
										<AdvText>No definition was found for this query!</AdvText>
									</AbsoluteCenter>
								:
								<AbsoluteCenter bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4">
									<HStack gap="3">
										<Spinner size="sm" colorPalette="blue" />
										<Text fontSize="sm" color="fg.muted">
											Loading...
										</Text>
									</HStack>
								</AbsoluteCenter>
							}
						</FloatingPanel.Body>
						<FloatingPanel.ResizeTriggers />
					</FloatingPanel.Content>
				</FloatingPanel.Positioner>
			</Portal>
		</FloatingPanel.Root>
	)
}