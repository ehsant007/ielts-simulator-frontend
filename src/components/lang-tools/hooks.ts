import { useEffect, useRef, useState } from "react"
import { getSelection1 } from "./util"

export function useTextSelection() {
	const selectionRangeRef = useRef<Range | null>(null)
	const [text, setText] = useState<string | null>(null)
	const [rect, setRect] = useState<DOMRect | null>(null)

	useEffect(() => {

		const reset = () => {
			selectionRangeRef.current = null
			setRect(null)
			setText(null)
		}

		const set = (range: Range, text: string) => {
			selectionRangeRef.current = range
			setRect(range.getBoundingClientRect())
			setText(text)
		}

		const onScroll = () => {
			if (!selectionRangeRef.current)
				return
			setRect(selectionRangeRef.current.getBoundingClientRect())
		}

		const onSelectionChange = () => {
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


		document.addEventListener("selectionchange", onSelectionChange)
		document.addEventListener("scroll", onScroll, true)

		return () => {
			document.removeEventListener("selectionchange", onSelectionChange)
			document.removeEventListener("scroll", onScroll, true)
		}
	}, [])

	return { text, rect }
}