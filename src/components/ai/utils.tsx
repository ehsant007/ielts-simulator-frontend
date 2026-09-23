"use client"

import { Box, ScrollArea, ScrollAreaRootProps, Collapsible, CollapsibleRootProps, IconButton, IconButtonProps, BoxProps, HStack, Button, Icon } from "@chakra-ui/react"
import { LuCheck, LuChevronDown, LuChevronRight, LuCopy } from "react-icons/lu"
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useFormatter } from "next-intl"
import { StickToBottomInstance } from "use-stick-to-bottom"

export const Scroller = forwardRef<HTMLDivElement, ScrollAreaRootProps>(({ children, ...props }, ref) => {
	return (
		<ScrollArea.Root {...props} ref={ref}>
			<ScrollArea.Viewport>
				<ScrollArea.Content
					style={{
						minWidth: 0,
					}}

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


export function PartialCollapse({
	children,
	collapsedHeight,
	bg,
}: {
	children: React.ReactNode
	collapsedHeight: string
	bg: BoxProps["bg"]
}) {
	const contentRef = useRef<HTMLDivElement>(null)

	const [contentHeight, setContentHeight] = useState<number | null>(null)
	const [hasOverflow, setHasOverflow] = useState(false)
	const [open, setOpen] = useState(false)

	useLayoutEffect(() => {
		const element = contentRef.current
		if (!element) return

		const rem = parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		)
		const collapsedHeight = 20 * rem

		const measure = () => {
			const height = element.scrollHeight
			setContentHeight(height)
			setHasOverflow(height > collapsedHeight)
		}

		measure()

		const observer = new ResizeObserver(measure)
		observer.observe(element)

		return () => observer.disconnect()
	}, [])

	const maxHeight =
		contentHeight === null || !hasOverflow
			? "none"
			: open
				? `${contentHeight}px`
				: collapsedHeight

	return (
		<Box>
			<Box
				pos="relative"
				maxH={maxHeight}
				overflow="hidden"
				transition="max-height 0.25s ease"
				background={bg}
			>
				<Box ref={contentRef}>
					{children}
				</Box>

				{hasOverflow && !open && (
					<Box
						pos="absolute"
						bottom="0"
						insetInlineStart="0"
						insetInlineEnd="0"
						h="4rem"
						pointerEvents="none"
						bgGradient="to-b"
						gradientFrom="transparent"
						gradientTo={bg?.toString()}
					/>
				)}
			</Box>

			{hasOverflow && (
				<HStack justify="start" mt="2">
					<Button
						variant="plain"
						size="sm"
						height="auto"
						minH="0"
						p="0"
						color="fg.muted"
						_hover={{
							bg: "transparent",
							color: "fg",
						}}
						_active={{
							bg: "transparent",
						}}
						onClick={() => setOpen(value => !value)}
					>
						{open ? "Show Less" : "Show More"}
						<Icon
							transition="transform 0.2s"
							transform={open ? "rotate(180deg)" : "rotate(0deg)"}
						>
							<LuChevronDown />
						</Icon>
					</Button>
				</HStack>
			)}
		</Box>
	)
}