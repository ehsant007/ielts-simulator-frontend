"use client"

import { Box, Center, HStack, IconButton, Progress, Spinner, Text, TextProps, VStack } from "@chakra-ui/react"
import { Fragment, useState } from "react"
import YouTube, { YouTubeEvent, type YouTubeProps } from "react-youtube"
import { useCurrentSubtitleSegment } from "./hooks"
import { PlayerProvider, usePlayer, usePlayerTime } from "./PlayerProvider"
import type { MouseEvent } from "react"
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from "react-icons/lu"
import { LookupProvider, useCorpusLookupContext } from "./LookupProvider"
import { TbRewindBackward5, TbRewindForward5 } from "react-icons/tb";
import { CorpusStoreProvider } from "./CorpusStoreProvider"
import { CorpusSegmentRead, SegmentWord } from "@/client"
import { MdReplay } from "react-icons/md"

type Props = {
	lemma: string,
	pos: string
}

export function CorpusYoutubePlayer({ lemma, pos }: Props) {

	return (
		<CorpusStoreProvider>
			<PlayerProvider>
				<LookupProvider
					lemma={lemma}
					pos={pos}
					key={JSON.stringify([lemma, pos])}
				>
					<CorpusYoutubePlayerInner />
				</LookupProvider>
			</PlayerProvider>
		</CorpusStoreProvider>
	)
}


export function CorpusYoutubePlayerInner() {
	const { player, setPlayer, setState, setDuration } = usePlayer()
	const { media, index, total, segment } = useCorpusLookupContext()

	const options: YouTubeProps["opts"] = {
		// width: "640",
		// height: "390",
		playerVars: {
			autoplay: 1,
			origin: typeof window !== "undefined"
				? window.location.origin
				: undefined,
			enablejsapi: 1,
			start: Math.floor(segment?.start ?? 0)
		},
	}

	const handleStateChange = async (event: YouTubeEvent) => {
		const state = event.data
		setState(state)

		const duration = await player?.getDuration()
		setDuration(duration)
	}

	const onReady = async (event: YouTubeEvent) => {
		setPlayer(event.target)
	}

	return (
		<VStack>
			{media &&
				<YouTube
					videoId={media.media_id!}
					opts={options}
					onReady={onReady}
					onStateChange={handleStateChange}
				/>
			}
			<Text>{index + 1} / {total}</Text>
			<PlayerControls />
			{media &&
				<Box textAlign="center">
					<SubtitleView />
				</Box>
			}
		</VStack>
	)
}


function PlayerControls() {
	return (
		<VStack w="full">
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
			if (state < 3)
				setIsPlaying(state === 1)

			setIsLoading(state === 3)
		}
	})

	const togglePlayback = () => {
		if (isPlaying) {
			setIsPlaying(false)
			if (player)
				player.pauseVideo()
		}
		else {
			setIsPlaying(true)
			if (player)
				player.playVideo()
		}
	}

	const move = async (step: number) => {
		if (!player)
			return
		await player.seekTo(await player.getCurrentTime() + step, true)
	}


	if (!player)
		return null

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

				{isLoading &&
					<Center pos="absolute">
						<Spinner size="lg" />
					</Center>
				}
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
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60);

	return (
		<Text
			fontSize="1xl"
			fontFamily="mono"
			as="span"
		>
			{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
		</Text>
	);
}

function TimeLine() {
	const [progress, setProgress] = useState(0)

	const { player, duration, time } = usePlayerTime({
		deltaMs: 100,
		onTick: time => {
			if (duration == null) {
				setProgress(0)
				return
			}
			const p = duration ? time / duration * 100 : 0
			setProgress(p)
		}
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
	const { segment, isCurrentWord } = useCurrentSubtitleSegment(media?.id, time, 5)

	if (segment == null)
		return null

	return (
		<SegmentView
			segment={segment}
			highlightWord={isCurrentWord}
		/>
	)
}


function SegmentView({ segment, highlightWord, ...props }: {
	segment: CorpusSegmentRead,
	highlightWord?: (word: SegmentWord) => boolean,
} & TextProps) {
	const { player } = usePlayer()

	return (
		<Text {...props}>
			{segment?.words.map((w, i) => (
				<Fragment key={i}>
					<span
						className={highlightWord?.(w) ? "highlight" : ""}
						onClick={() => player?.seekTo(w.start, true)}
						style={{ cursor: "pointer" }}
					>
						{w.word}
					</span>
					{" "}
				</Fragment>
			))}
		</Text>
	)
}
