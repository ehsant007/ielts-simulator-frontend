"use client"

import React, { useState } from "react"
import { Box, Menu, Portal } from "@chakra-ui/react"
import { LuClipboardPaste, LuCopy, LuDelete, LuHighlighter } from "react-icons/lu";
import { useLangToolsStore, getHighlightGroupId, getSelectedText, getTokenWord } from "../lang-tools";
import { BsTranslate } from "react-icons/bs";

export type ContextMenuState = {
	x: number,
	y: number,
	target: EventTarget | null
	highlightGroupId: number | null
	selectedText: string | null | undefined
	word: string | null
}

export type ContextMenuProps = {
	children: React.ReactNode
	paste?: ((context: ContextMenuState) => void) | undefined
}

export function ContextMenu({ children, paste }: ContextMenuProps) {
	const highlightSelectedText = useLangToolsStore((state) => state.highlightSelectedText)
	const removeHighlight = useLangToolsStore((state) => state.removeHighlight)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)

	const [open, setOpen] = useState(false)

	const copiedText = useLangToolsStore((state) => state.copiedText)
	const setCopiedText = useLangToolsStore((state) => state.setCopiedText)

	const [context, setContext] = useState<ContextMenuState>({
		x: 0,
		y: 0,
		target: null,
		highlightGroupId: null,
		selectedText: null,
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
			selectedText: getSelectedText()?.trim(),
			highlightGroupId: getHighlightGroupId(e.target),
			word: getTokenWord(e.target),
		})

		setOpen(true)
	}

	async function copy() {
		if (context.selectedText) {
			setCopiedText(context.selectedText)
			await navigator.clipboard.writeText(context.selectedText);
		}
	}

	function translate() {
		if (context.word)
			setWordQuery(context.word)
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
								onSelect={translate}
							>
								<BsTranslate />
								<Box flex="1">Translate</Box>
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item
								value="highlight"
								disabled={!context.selectedText}
								onSelect={highlightSelectedText}
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
								disabled={!context.selectedText}
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

