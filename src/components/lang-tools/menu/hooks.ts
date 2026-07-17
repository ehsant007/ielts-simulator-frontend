import { useEffect, useRef, useState } from "react"
import { useLangToolsStore } from "..";
import { useKokoroStore, speak as speakAudio } from "../kokoro-tts";
import { getSelection1 } from "../util";


export function useMenu() {
	const highlight = useLangToolsStore((state) => state.highlightSelectedText)
	const removeHighlight = useLangToolsStore((state) => state.removeHighlight)
	const setWordQuery = useLangToolsStore((state) => state.setWordQuery)
	const generate = useKokoroStore((state) => state.generate)

	const [open, setOpen] = useState(false)
	const selectionRangeRef = useRef<Range | null>(null)
	const [selectedText, setSelectedText] = useState<string | null>(null)
	const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null)

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


	useEffect(() => {

		const reset = () => {
			selectionRangeRef.current = null
			setSelectionRect(null)
			setSelectedText(null)
		}

		const set = (range: Range, text: string) => {
			selectionRangeRef.current = range
			setSelectionRect(range.getBoundingClientRect())
			setSelectedText(text)
		}

		const onScroll = () => {
			if (!selectionRangeRef.current)
				return
			setSelectionRect(selectionRangeRef.current.getBoundingClientRect())
		}

		const onPointerUp = () => {
			const selection = getSelection1()

			if (!selection) {
				reset()
				return;
			}
			
			const text = selection.toString().trim()
			if (!text) {
				reset()
				return
			}

			set(selection.getRangeAt(0), text)
		}


		document.addEventListener("pointerup", onPointerUp)
		//document.addEventListener("pointerdown", reset)
		document.addEventListener("scroll", onScroll, true)

		return () => {
			document.removeEventListener("pointerup", onPointerUp)
			//document.removeEventListener("pointerdown", reset)
			document.removeEventListener("scroll", onScroll, true)
		}
	}, [])


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
