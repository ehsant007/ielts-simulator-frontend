"use client"

import React, { useState } from "react"
import { Box, Menu, Portal } from "@chakra-ui/react"
import { LuClipboardPaste, LuCopy, LuDelete, LuHighlighter } from "react-icons/lu";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useMenu } from "./hooks";
import { getHighlightGroupId, getTokenWord } from "../util";


export type ContextMenuState = {
	x: number,
	y: number,
	target: EventTarget | null
	highlightGroupId: number | null
	word: string | null
}


export type ContextMenuProps = {
	children: React.ReactNode
	paste?: ((context: ContextMenuState) => void) | undefined
}


export function ContextMenu({ children, paste }: ContextMenuProps) {
	const {
		open,
		setOpen,
		selectedText,
		highlight,
		removeHighlight,
		copiedText,
		copy,
		translate,
		speak,
	} = useMenu()

	const [context, setContext] = useState<ContextMenuState>({
		x: 0,
		y: 0,
		target: null,
		highlightGroupId: null,
		word: null,
	})

	function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
		if (e.ctrlKey)
			return

		e.preventDefault()
		e.stopPropagation()

		setContext({
			x: e.clientX,
			y: e.clientY,
			target: e.target,
			highlightGroupId: getHighlightGroupId(e.target),
			word: getTokenWord(e.target),
		})

		setOpen(true)
	}

	return (
		<Box onContextMenu={handleContextMenu}>
			{children}
			<Portal>
				<Box position="fixed" left={context.x} top={context.y} zIndex="max">
					<Menu.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
						<Menu.Content>
							<Menu.Item
								value="translate"
								disabled={!context.word}
								onSelect={() => translate(context.word)}
							>
								<BsTranslate />
								<Box flex="1">Translate</Box>
							</Menu.Item>
							<Menu.Item
								value="speak"
								disabled={!context.word}
								onSelect={speak}
							>
								<HiOutlineSpeakerWave />
								<Box flex="1">Speak</Box>
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item
								value="highlight"
								disabled={!selectedText}
								onSelect={highlight}
							>
								<LuHighlighter />
								<Box flex="1">Highlight</Box>
							</Menu.Item>

							<Menu.Item
								value="remove-highlight"
								disabled={context.highlightGroupId == null}
								onSelect={() => context.highlightGroupId != null && removeHighlight(context.highlightGroupId)}
							>
								<LuDelete />
								<Box flex="1">Remove Highlight</Box>
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item
								value="copy"
								disabled={!selectedText}
								onSelect={copy}
							>
								<LuCopy />
								<Box flex="1">Copy</Box>
								<Menu.ItemCommand>Ctrl+C</Menu.ItemCommand>
							</Menu.Item>

							<Menu.Item
								value="paste"
								disabled={copiedText == null || !(context.target instanceof HTMLInputElement)}
								onSelect={() => paste?.(context)}
							>
								<LuClipboardPaste />
								<Box flex="1">Paste</Box>
								<Menu.ItemCommand>Ctrl+V</Menu.ItemCommand>
							</Menu.Item>
						</Menu.Content>
					</Menu.Root>
				</Box>
			</Portal>
		</Box>
	)
}

