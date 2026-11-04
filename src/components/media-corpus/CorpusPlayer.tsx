"use client"

import {
	AspectRatio,
	Box,
	type BoxProps,
	Center,
	Highlight,
	HStack,
	IconButton,
	Progress,
	Spinner,
	type StackProps,
	Text,
	VStack,
} from "@chakra-ui/react"
import type { MouseEvent } from "react"
import { Fragment, useState } from "react"
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from "react-icons/lu"
import { MdReplay } from "react-icons/md"
import { TbRewindBackward5, TbRewindForward5 } from "react-icons/tb"
import YouTube, { type YouTubeEvent, type YouTubeProps } from "react-youtube"
import type { CorpusSegmentRead } from "@/client"
import {
	CorpusLookupProvider,
	useCorpusLookupContext,
} from "./CorpusLookupProvider"
import { useCurrentSubtitleSegment } from "./hooks"
import { PlayerProvider, usePlayer, usePlayerTime } from "./PlayerProvider"

type Props = {
	lemma: string
	partOfSpeech?: string
}&StackProps

export function CorpusPlayer({ lemma, partOfSpeech, ...props }: Props) {
	return (
		<PlayerProvider>
			<CorpusLookupProvider
				lemma={lemma}
				partOfSpeech={partOfSpeech}
				key={JSON.stringify([lemma, partOfSpeech])}
			>
				<CorpusYoutubePlayerInner {...props}/>
			</CorpusLookupProvider>
		</PlayerProvider>
	)
}

export function CorpusYoutubePlayerInner(props: StackProps) {
	const { setPlayer, setState, setDuration } = usePlayer()
	const { media, index, total, segment } = useCorpusLookupContext()

	const options: YouTubeProps["opts"] = {
		playerVars: {
			autoplay: 1,
			origin:
				typeof window !== "undefined" ? window.location.origin : undefined,
			enablejsapi: 1,
			start: Math.floor(segment?.start ?? 0),
		},
	}

	const handleStateChange = async (event: YouTubeEvent) => {
		const state = event.data
		setState(state)

		const duration = await event.target.getDuration()
		setDuration(duration)
	}

	const onReady = async (event: YouTubeEvent) => {
		setPlayer(event.target)
	}

	return (
		<VStack {...props}>
			{media && (
				<AspectRatio
					ratio={16 / 9}
					w="full"
					css={{ "& iframe": { width: "100%", height: "100%" } }}
				>
					<YouTube
						videoId={media?.media_id ?? undefined}
						opts={options}
						onReady={onReady}
						onStateChange={handleStateChange}
						style={{ width: "100%", height: "100%" }}
					/>
				</AspectRatio>
			)}
			<Text>
				{index + 1} / {total}
			</Text>
			<PlayerControls w="full" />
			{media && (
				<Box textAlign="center">
					<SubtitleView />
				</Box>
			)}
		</VStack>
	)
}

function PlayerControls(props: StackProps) {
	return (
		<VStack {...props}>
			<TimeLine />
			<PlayerButtons />
		</VStack>
	)
}

function PlayerButtons() {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const { nextSegment, prevSegment, segment } = useCorpusLookupContext()

	const { player } = usePlayer({
		onStateChange: async (state) => {
			if (state < 3) setIsPlaying(state === 1)

			setIsLoading(state === 3)
		},
	})

	const togglePlayback = () => {
		if (isPlaying) {
			setIsPlaying(false)
			if (player) player.pauseVideo()
		} else {
			setIsPlaying(true)
			if (player) player.playVideo()
		}
	}

	const move = async (step: number) => {
		if (!player) return
		await player.seekTo((await player.getCurrentTime()) + step, true)
	}

	if (!player) return null

	return (
		<HStack>
			<IconButton
				colorPalette="primary"
				borderRadius="full"
				onClick={() => segment && player.seekTo(segment.start, true)}
			>
				<MdReplay />
			</IconButton>

			<IconButton
				colorPalette="primary"
				borderRadius="full"
				onClick={prevSegment}
			>
				<LuSkipBack />
			</IconButton>

			<IconButton
				colorPalette="primary"
				borderRadius="full"
				onClick={() => move(-5)}
			>
				<TbRewindBackward5 />
			</IconButton>

			<IconButton
				aria-label={isPlaying ? "Pause video" : "Play video"}
				colorPalette="primary"
				borderRadius="full"
				onClick={togglePlayback}
				pos="relative"
			>
				{isPlaying ? <LuPause /> : <LuPlay />}

				{isLoading && (
					<Center pos="absolute">
						<Spinner size="lg" />
					</Center>
				)}
			</IconButton>

			<IconButton
				colorPalette="primary"
				borderRadius="full"
				onClick={() => move(5)}
			>
				<TbRewindForward5 />
			</IconButton>

			<IconButton
				colorPalette="primary"
				borderRadius="full"
				onClick={nextSegment}
			>
				<LuSkipForward />
			</IconButton>
		</HStack>
	)
}

function Time({ value }: { value: number }) {
	const minutes = Math.floor(value / 60)
	const seconds = Math.floor(value % 60)

	return (
		<Text fontSize="1xl" fontFamily="mono" as="span">
			{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
		</Text>
	)
}

function TimeLine() {
	const [progress, setProgress] = useState(0)

	const { player, duration, time } = usePlayerTime({
		deltaMs: 100,
		onTick: (time) => {
			const p = duration ? (time / duration) * 100 : 0
			setProgress(p)
		},
	})

	const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const x = e.clientX - rect.left
		const p = x / rect.width
		if (duration) {
			setProgress(p * 100)
			player?.seekTo(p * duration, true)
		}
	}

	return (
		<Progress.Root
			value={progress}
			cursor="pointer"
			colorPalette="primary"
			onClick={handleSeek}
			size="xs"
			w="full"
		>
			<Progress.Label mb="21">
				<Text fontWeight="bold">
					<Time value={time} />
					<span> / </span>
					<Time value={duration ?? 0} />
				</Text>
			</Progress.Label>
			<Progress.Track>
				<Progress.Range transition="none" />
			</Progress.Track>
		</Progress.Root>
	)
}

function SubtitleView() {
	const { media } = useCorpusLookupContext()
	const { time } = usePlayerTime({ deltaMs: 50 })
	const { segment } = useCurrentSubtitleSegment(media?.id, time, 5)

	if (segment == null) return null

	return <SegmentView mt="1rem" fontSize="lg" segment={segment} time={time} />
}

function SegmentView({
	segment,
	time,
	...props
}: {
	segment: CorpusSegmentRead
	time: number
} & BoxProps) {
	const { player } = usePlayer()
	const { entry: { lemma } = {} } = useCorpusLookupContext()

	return (
		<Box {...props} pos="relative">
			<Box>
				{segment?.words.map((w, i) => (
					<Fragment key={i}>
						<button
							type="button"
							className={time >= w.start && time < w.end ? "highlight" : ""}
							onClick={() => player?.seekTo(w.start, true)}
							style={{
								cursor: "pointer",
								color: "transparent",
								font: "inherit",
								lineHeight: "inherit",
								padding: 0,
								border: 0,
							}}
						>
							{w.word}
						</button>{" "}
					</Fragment>
				))}
			</Box>

			<Box position="absolute" inset="0" pointerEvents="none">
				<Highlight query={lemma ?? []} styles={{ color: "orange.fg" }}>
					{segment.text}
				</Highlight>
			</Box>
		</Box>
	)
}
