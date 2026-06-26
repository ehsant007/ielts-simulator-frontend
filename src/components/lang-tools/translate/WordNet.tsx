"use client"

import { useEffect, useState } from "react";
import { useLangToolsStore } from "../LangToolsProvider";
import { WordNetServer } from "./WordNetServer";
import { readWordnet, WordNetData } from "@/client";
import { Box, Button, CloseButton, Drawer, Portal, FloatingPanel, IconButton } from "@chakra-ui/react";
import { WordNetResult } from "./WordNetResult";
import { LuGripHorizontal, LuMaximize2, LuMinus, LuSquare, LuX } from "react-icons/lu";

export function WordNet() {
	const word = useLangToolsStore((state) => state.wordQuery)
	const [result, setResult] = useState<WordNetData | null>(null)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!word)
			return

		setResult(null)
		setOpen(true)

		readWordnet({
			path: {
				word
			}
		}).then((res) => setResult(res.data))
	}, [word])


	return (
		<FloatingPanel.Root
			open={open}
			onOpenChange={(details) => setOpen(details.open)}

			minSize={{ width: 320, height: 200 }}
		>
			<Portal>
				<FloatingPanel.Positioner>
					<FloatingPanel.Content>
						<FloatingPanel.Header>
							<FloatingPanel.DragTrigger>
								<LuGripHorizontal />
								<FloatingPanel.Title>{word}</FloatingPanel.Title>
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
						<FloatingPanel.Body>
							{result ?
								<WordNetResult data={result} />
								:
								<Box>Loading</Box>
							}
						</FloatingPanel.Body>
						<FloatingPanel.ResizeTriggers />
					</FloatingPanel.Content>
				</FloatingPanel.Positioner>
			</Portal>
		</FloatingPanel.Root>
	)
}