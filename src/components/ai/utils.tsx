import { Box, ScrollArea, ScrollAreaRootProps, Collapsible, CollapsibleRootProps, IconButton, IconButtonProps } from "@chakra-ui/react"
import { LuCheck, LuChevronRight, LuCopy } from "react-icons/lu"
import { forwardRef, useState } from "react"
import { useFormatter } from "next-intl"


export const Scroller = forwardRef<HTMLDivElement, ScrollAreaRootProps>(({ children, ...props }, ref) => {
	return (
		<ScrollArea.Root {...props} pe="3" ref={ref}>
			<ScrollArea.Viewport ref={ref}>
				<ScrollArea.Content spaceY="4" textStyle="sm">

					{children}

				</ScrollArea.Content>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar>
				<ScrollArea.Thumb />
			</ScrollArea.Scrollbar>
			<ScrollArea.Corner />
		</ScrollArea.Root>
	)
})
Scroller.displayName = "Scroller"


export function Collapse({ children, title, ...props }: CollapsibleRootProps) {
	return (
		<Collapsible.Root defaultOpen {...props}>
			<Collapsible.Trigger
				display="flex"
				cursor="pointer"
				alignItems="center"
				//w="full"
				color="fg.muted"
			>
				{title}
				<Collapsible.Indicator
					transition="transform 0.2s"
					_open={{ transform: "rotate(90deg)" }}
				>
					<LuChevronRight />
				</Collapsible.Indicator>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Box>
					{children}
				</Box>
			</Collapsible.Content>
		</Collapsible.Root>
	)
}

export function ChatTime({ dt }: { dt: string }) {
	const format = useFormatter()

	const date = new Date(dt)
	const now = new Date()

	const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	const diffDays = Math.round(
		(today.getTime() - dateDay.getTime()) / 86_400_000,
	)

	const time = format.dateTime(date, {
		hour: "numeric",
		minute: "2-digit",
	})

	if (diffDays === 0) return `Today ${time}`
	if (diffDays === 1) return `Yesterday ${time}`

	return format.dateTime(date, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	})
}

export function isSameDay(a: string, b: string) {
	const dateA = new Date(a)
	const dateB = new Date(b)

	return (
		dateA.getFullYear() === dateB.getFullYear() &&
		dateA.getMonth() === dateB.getMonth() &&
		dateA.getDate() === dateB.getDate()
	)
}

export function CopyButton({ text, ...props }: { text: string } & IconButtonProps) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		await navigator.clipboard.writeText(text)
		setCopied(true)

		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<IconButton
			aria-label="Copy message"
			size="xs"
			variant="ghost"
			transition="opacity 0.15s"
			onClick={copy}
			{...props}
		>
			{copied ? <LuCheck /> : <LuCopy />}
		</IconButton>
	)
}

