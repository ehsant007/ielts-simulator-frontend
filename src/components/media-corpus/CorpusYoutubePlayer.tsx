"use client"

import { Center, HStack, IconButton, Progress, Spinner, Text, VStack } from "@chakra-ui/react"
import { Fragment, useState } from "react"
import YouTube, { type YouTubeProps } from "react-youtube"
import { useCurrentSubtitleSegment } from "./hooks"
import { PlayerProvider, usePlayer, usePlayerTime } from "./PlayerProvider"
import type { MouseEvent } from "react"
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from "react-icons/lu"
import { LookupProvider, useCorpusLookupContext } from "./LookupProvider"
import { TbRewindBackward5, TbRewindForward5 } from "react-icons/tb";

type Props = {
	lemma: string,
	pos: string
}

export function CorpusYoutubePlayer({ lemma, pos }: Props) {

	return (
		<LookupProvider lemma={lemma} pos={pos}>
			<PlayerProvider>
				<CorpusYoutubePlayerInner />
			</PlayerProvider>
		</LookupProvider>
	)
}


export function CorpusYoutubePlayerInner() {
	const { setPlayer, setState } = usePlayer()
	const { media, index, total } = useCorpusLookupContext()

	const options: YouTubeProps["opts"] = {
		// width: "640",
		// height: "390",
		playerVars: {
			autoplay: 0,
		},
	}


	return (
		<VStack>
			{media &&
				<YouTube
					videoId={media.media_id!}
					opts={options}
					onReady={(event) => setPlayer(event.target)}
					onStateChange={(event) => setState(event.data)}
				/>
			}
			<Text>{index + 1} / {total}</Text>
			<PlayerControls />
			{media &&
				<Text textAlign="center">
					<SubtitleView mediaId={media.id} />
				</Text>
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
	const { nextSegment, prevSegment } = useCorpusLookupContext()

	const { player } = usePlayer({
		onStateChange: state => {
			if (state < 2)
				setIsPlaying(state === 1)

			setIsLoading(state === 3)
		}
	})


	if (!player)
		return null

	const togglePlayback = () => {
		if (isPlaying) {
			setIsPlaying(false)
			void player.pauseVideo()
		}
		else {
			setIsPlaying(true)
			void player.playVideo()
		}
	}

	const move = async (step: number) => {
		await player.seekTo(await player.getCurrentTime() + step, true)
	}

	return (
		<HStack>
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


function SubtitleView({ mediaId }: { mediaId: number }) {
	const { player, time } = usePlayerTime({ deltaMs: 50 })
	const { segment, isCurrentWord } = useCurrentSubtitleSegment(mediaId, time)

	return (
		<>
			{segment?.words.map((w, i) => (
				<Fragment key={i}>
					<span
						className={isCurrentWord(w) ? "highlight" : ""}
						onClick={() => player?.seekTo(w.start, true)}
					>
						{w.word}
					</span>
					{" "}
				</Fragment>
			))}
		</>
	)
}
