import { ActionBar, Box, IconButton, IconButtonProps, Portal } from "@chakra-ui/react";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { LuCopy, LuHighlighter } from "react-icons/lu";
import { useMenu } from "./hooks"


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
		selectedText,
		selectionRect: rect,
		highlight,
		copy,
		translate,
		speak,
	} = useMenu()

	if (!rect)
		return null

	return (

		<ActionBar.Root open={!!selectedText}>
			<Portal>
				<Box
					position="fixed"
					left={rect.left + rect.width / 2}
					top={rect.top - 8}
					transform={"translate(-50%, -100%)"}
					zIndex="popover"
				>
					<ActionBar.Content borderRadius="full" p="1" bg="bg.info" gap="1">
						<MenuItem>
							<HiOutlineSpeakerWave onClick={speak} />
						</MenuItem>
						<MenuItem>
							<LuHighlighter onClick={highlight} />
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