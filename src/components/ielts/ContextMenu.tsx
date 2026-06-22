"use client"

import React, { useRef, useState } from "react"
import { Box, Menu, Portal } from "@chakra-ui/react"
import { LuClipboardPaste, LuCopy, LuCross, LuDelete, LuHighlighter } from "react-icons/lu";
import { useLangToolsStore } from "../lang-tools";

type Point = { x: number; y: number }

export function ContextMenu({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState<Point>({ x: 0, y: 0 })
	const clipBoard = useRef<string>(null)
	const highlightSelectedText = useLangToolsStore((state) => state.highlightSelectedText)
	const removeHighlight = useLangToolsStore((state) => state.removeHighlight)
	const targetRef = useRef<unknown>(null)
	const [groupId, setGroupId] = useState<number | null>(null)

	function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
		targetRef.current = e.target
		if (e.target instanceof HTMLInputElement)
			return

		setGroupId(null)

		if (e.target instanceof HTMLElement) {

			let node: HTMLElement | null = e.target
			while (node != null) {
				if (node.hasAttribute("data-group-id"))
					break
				node = node.parentElement
			}
			if (node) {
				const groupId = node.dataset.groupId
				setGroupId(groupId ? Number(groupId) : null)
			}
		}

		e.preventDefault()
		setPosition({ x: e.clientX, y: e.clientY })
		setOpen(true)
	}

	async function copy() {
		clipBoard.current = getSelectedText()
		await handleCopy()
	}



	return (
		<Box onContextMenu={handleContextMenu}>
			{children}

			{open && (
				<Portal>
					<Box
						position="fixed"
						left={position.x}
						top={position.y}
						zIndex="modal"
					>
						<Menu.Root
							open={open}
							onOpenChange={(e) => setOpen(e.open)}
						>
							<Menu.Content>
								<Menu.Item value="highlight" disabled={!getSelectedText()} onSelect={highlightSelectedText}>
									<LuHighlighter />
									<Box flex="1">Highlight</Box>
								</Menu.Item>

								<Menu.Item value="remove-highlight" disabled={groupId == null} onSelect={() => groupId != null && removeHighlight(groupId)}>
									<LuDelete />
									<Box flex="1">Remove Highlight</Box>
								</Menu.Item>

								<Menu.Item value="copy" disabled={!getSelectedText()} onSelect={copy}>
									<LuCopy />
									<Box flex="1">Copy</Box>
									<Menu.ItemCommand>⌘C</Menu.ItemCommand>
								</Menu.Item>
								<Menu.Item value="paste">
									<LuClipboardPaste />
									<Box flex="1">Paste</Box>
									<Menu.ItemCommand>⌘V</Menu.ItemCommand>
								</Menu.Item>
							</Menu.Content>
						</Menu.Root>
					</Box>
				</Portal>
			)}
		</Box>
	)
}


function getSelectedText() {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return null
	}

	return selection.toString().trim()
}



async function handleCopy() {
	const selectedText = getSelectedText()

	if (selectedText) {
		await navigator.clipboard.writeText(selectedText);
	}
}


