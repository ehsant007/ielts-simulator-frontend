import { useState } from "react"
import { useLangToolsStore } from "..";
import { useKokoroStore, speak as speakAudio } from "../kokoro-tts";
import { useTextSelection } from "../hooks";

export function useMenu() {
	const highlight = useLangToolsStore((state) => state.highlightSelectedText)
	const removeHighlight = useLangToolsStore((state) => state.removeHighlight)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const generate = useKokoroStore((state) => state.generate)

	const [open, setOpen] = useState(false)

	const { text: selectedText, rect: selectionRect } = useTextSelection()

	const copiedText = useLangToolsStore((state) => state.copiedText)
	const setCopiedText = useLangToolsStore((state) => state.setCopiedText)


	async function copy() {
		if (!selectedText)
			return
		setCopiedText(selectedText)
		await navigator.clipboard.writeText(selectedText)
	}

	function translate(text: string | null | undefined) {
		if (!text)
			return
		setWordQuery(text)
	}

	async function speak() {
		if (!selectedText)
			return
		generate(selectedText, (audio) => speakAudio(audio), false)
	}


	return {
		open,
		setOpen,
		selectedText,
		selectionRect,
		highlight,
		removeHighlight,
		copiedText,
		copy,
		translate,
		speak,
	}
}
