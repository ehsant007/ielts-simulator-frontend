"use client"

import {
	AspectRatio,
	Box,
	type BoxProps,
	Center,
	Grid,
	Highlight,
	HStack,
	IconButton,
	type IconButtonProps,
	Progress,
	Spinner,
	type StackProps,
	Text,
	VStack,
} from "@chakra-ui/react"
import type { MouseEvent } from "react"
import { Fragment, useEffect, useState } from "react"
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

type CorpusPlayerProps = {
	lemma: string
	partOfSpeech?: string
	play?: boolean
	pause?: boolean
} & StackProps

export function CorpusPlayer({
	lemma,
	partOfSpeech,
	play,
	pause,
	...props
}: CorpusPlayerProps) {
	return (
		<PlayerProvider key={JSON.stringify([lemma, partOfSpeech])}>
			<CorpusLookupProvider lemma={lemma} partOfSpeech={partOfSpeech}>
				<CorpusYoutubePlayerInner play={play} pause={pause} {...props} />
			</CorpusLookupProvider>
		</PlayerProvider>
	)
}

export function CorpusYoutubePlayerInner({
	play,
	pause,
	...props
}: { play?: boolean; pause?: boolean } & StackProps) {
	const { player, setPlayer, setState, setDuration } = usePlayer()
	const { media, segment, isError } = useCorpusLookupContext()

	const options: YouTubeProps["opts"] = {
		playerVars: {
			autoplay: 1,
			origin:
				typeof window !== "undefined" ? window.location.origin : undefined,
			enablejsapi: 1,
			start: Math.floor(segment?.start ?? 0),
		},
	}

	useEffect(() => {
		if (!player || play == null) return
		try {
			if (play) player.playVideo()
		} catch {
			// player was destroyed or is not ready yet
		}
	}, [play, player])

	useEffect(() => {
		if (!player || pause == null) return
		try {
			if (pause) player.pauseVideo()
		} catch {
			// player was destroyed or is not ready yet
		}
	}, [pause, player])

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
			<AspectRatio
				ratio={16 / 9}
				w="full"
				css={{ "& iframe": { width: "100%", height: "100%" } }}
			>
				<Box bg={isError ? "bg.warning" : "bg.emphasized"}>
					{media && (
						<YouTubePlayer
							videoId={media?.media_id ?? undefined}
							opts={options}
							onReady={onReady}
							onStateChange={handleStateChange}
							style={{ width: "100%", height: "100%" }}
						/>
					)}

					{isError && (
						<Center>
							<Text m="6" color="fg.warning" fontWeight="medium">
								No video found for this expression!
							</Text>
						</Center>
					)}
				</Box>
			</AspectRatio>

			<PlayerControls w="full" />

			<Box textAlign="center">
				<SubtitleView />
			</Box>
		</VStack>
	)
}

function YouTubePlayer(props: YouTubeProps) {
	const { setPlayer } = usePlayer()

	useEffect(() => {
		return () => setPlayer(null)
	}, [setPlayer])

	return <YouTube {...props} />
}

function PlayerControls(props: StackProps) {
	return (
		<VStack {...props}>
			<TimeLine />
			<Box mt="5" w="full">
				<PlayerButtons />
			</Box>
		</VStack>
	)
}

function PlayerButton({ children, ...props }: IconButtonProps) {
	return (
		<IconButton colorPalette="primary" borderRadius="full" {...props}>
			{children}
		</IconButton>
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

	//if (!player) return null

	return (
		<Grid templateColumns="1fr auto 1fr" alignItems="center" w="full">
			<HStack gridColumn="2">
				<PlayerButton
					colorPalette="primary"
					borderRadius="full"
					onClick={prevSegment}
				>
					<LuSkipBack />
				</PlayerButton>

				<PlayerButton
					colorPalette="primary"
					borderRadius="full"
					onClick={() => move(-5)}
				>
					<TbRewindBackward5 />
				</PlayerButton>

				<PlayerButton
					aria-label={isPlaying ? "Pause video" : "Play video"}
					colorPalette="primary"
					borderRadius="full"
					onClick={togglePlayback}
					pos="relative"
					size="xl"
				>
					{isPlaying ? <LuPause /> : <LuPlay />}

					{isLoading && (
						<Center pos="absolute">
							<Spinner size="lg" />
						</Center>
					)}
				</PlayerButton>

				<PlayerButton
					colorPalette="primary"
					borderRadius="full"
					onClick={() => move(5)}
				>
					<TbRewindForward5 />
				</PlayerButton>

				<PlayerButton
					colorPalette="primary"
					borderRadius="full"
					onClick={nextSegment}
				>
					<LuSkipForward />
				</PlayerButton>
			</HStack>

			<PlayerButton
				justifySelf="start"
				ms="10"
				gridColumn="3"
				colorPalette="primary"
				borderRadius="full"
				onClick={() => segment && player?.seekTo(segment.start, true)}
			>
				<MdReplay />
			</PlayerButton>
		</Grid>
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
	const { index, total } = useCorpusLookupContext()

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
			<Progress.Label mb="21" w="full">
				<Text fontWeight="bold">
					<Time value={time} />
					<span> / </span>
					<Time value={duration ?? 0} />
				</Text>

				<Text ms="auto" fontFamily="mono" fontWeight="bold">
					{index + 1} / {total}
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
	const { match, expression } = useCorpusLookupContext()

	const highlight_query = match ?? expression ?? []

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
				<Highlight
					query={highlight_query}
					styles={{ color: "orange.fg" }}
					ignoreCase
					matchAll
				>
					{segment.text}
				</Highlight>
			</Box>
		</Box>
	)
}
