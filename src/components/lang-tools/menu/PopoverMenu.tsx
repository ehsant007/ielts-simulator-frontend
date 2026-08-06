import { ActionBar, Box, IconButton, IconButtonProps, Portal } from "@chakra-ui/react";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { LuCopy, LuHighlighter } from "react-icons/lu";
import { useMenu } from "./hooks"
import { useEffect, useRef } from "react";


function MenuItem({ children, ...props }: IconButtonProps) {
	return (
		<IconButton
			variant="ghost"
			borderRadius="full"
			minW="unset"
			h="auto"
			p="2"
			size="md"
			{...props}
		>
			{children}
		</IconButton>
	)
}

export function PopoverMenu() {
	const {
		open,
		setOpen,
		selectedText,
		selectionRect: rect,
		highlight,
		copy,
		translate,
		speak,
	} = useMenu()

	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const onPointerUp = () => {
			setOpen(selectedText != null)
		}

		const onPointerDown = (e: Event) => {
			if (ref.current?.contains(e.target as Node))
				return
			setOpen(false)
		}

		document.addEventListener("pointerup", onPointerUp)
		document.addEventListener("pointerdown", onPointerDown)
		return () => {
			document.removeEventListener("pointerup", onPointerUp)
			document.removeEventListener("pointerdown", onPointerDown)
		}
	}, [selectedText, setOpen])


	if (!rect)
		return null

	return (

		<ActionBar.Root open={open}>
			<Portal>
				<Box
					position="fixed"
					left={rect.left + rect.width / 2}
					top={rect.top - 8}
					transform={"translate(-50%, -100%)"}
					zIndex="max"
					ref={ref}
				>
					<ActionBar.Content borderRadius="full" p="1" bg="bg.info" gap="1">
						<MenuItem onClick={speak}>
							<HiOutlineSpeakerWave />
						</MenuItem>
						<MenuItem onClick={highlight}>
							<LuHighlighter />
						</MenuItem>
						<MenuItem onClick={() => translate(selectedText)}>
							<BsTranslate />
						</MenuItem>
						<MenuItem onClick={copy}>
							<LuCopy />
						</MenuItem>
					</ActionBar.Content>
				</Box>
			</Portal>
		</ActionBar.Root>
	)
}