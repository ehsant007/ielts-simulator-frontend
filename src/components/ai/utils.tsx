"use client"

import { Box, ScrollArea, ScrollAreaRootProps, Collapsible, CollapsibleRootProps, IconButton, IconButtonProps } from "@chakra-ui/react"
import { LuCheck, LuChevronRight, LuCopy } from "react-icons/lu"
import { forwardRef, useEffect, useState } from "react"
import { useFormatter } from "next-intl"
import { StickToBottomInstance } from "use-stick-to-bottom"

export const Scroller = forwardRef<HTMLDivElement, ScrollAreaRootProps>(({ children, ...props }, ref) => {
	return (
		<ScrollArea.Root {...props} ref={ref}>
			<ScrollArea.Viewport ref={ref}>
				<ScrollArea.Content
					css={{
						"&[data-overflow-y]": {
							pe: "3"
						},
					}}
				>

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


export const StickToBottomScroller = forwardRef<HTMLDivElement, { sticky: StickToBottomInstance } & ScrollAreaRootProps>(({ children, sticky, ...props }, ref) => {
	return (
		<ScrollArea.Root {...props} ref={ref}>
			{/* eslint-disable-next-line react-hooks/refs */}
			<ScrollArea.Viewport ref={sticky.scrollRef}>
				<ScrollArea.Content
					/* eslint-disable-next-line react-hooks/refs */
					ref={sticky.contentRef}
				>

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
StickToBottomScroller.displayName = "StickToBottomScroller"


export function Collapse({ children, title, ...props }: { title: React.ReactNode } & Omit<CollapsibleRootProps, "title">) {
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


export function TextWriter({ children: text, delay = 30 }: { children: string, delay?: number }) {
	const [value, setValue] = useState("")

	useEffect(() => {
		const interval = setInterval(() => {
			setValue(prev => {
				if (prev.length >= text.length) {
					clearInterval(interval)
					return prev
				}

				return text.slice(0, prev.length + 1)
			})
		}, delay)

		return () => clearInterval(interval)
	}, [text, delay])

	return value
}

