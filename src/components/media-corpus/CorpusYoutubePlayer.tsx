"use client"

import { Box, Button, Progress, Text } from "@chakra-ui/react"
import { Fragment, useState } from "react"
import YouTube, { type YouTubeProps } from "react-youtube"
import { useCorpusLookup, useCurrentSubtitleSegment } from "./hooks"
import { PlayerProvider, usePlayer, usePlayerTime } from "./PlayerProvider"
import type { MouseEvent } from "react"


type Props = {
	lemma: string,
	pos: string
}

export function CorpusYoutubePlayer({ lemma, pos }: Props) {

	return (
		<PlayerProvider>
			<CorpusYoutubePlayerInner lemma={lemma} pos={pos} />
		</PlayerProvider>
	)
}


export function CorpusYoutubePlayerInner({ lemma, pos }: Props) {
	const { player, setPlayer } = usePlayer()
	const { nextSegment, prevSegment, segment, media, isPending, index, total } = useCorpusLookup(lemma, pos)

	const options: YouTubeProps["opts"] = {
		// width: "640",
		// height: "390",
		playerVars: {
			autoplay: 0,
		},
	}


	return (
		<Box>
			{media &&
				<YouTube
					videoId={media.media_id!}
					opts={options}
					onReady={(event) => setPlayer(event.target)}
				/>
			}
			<Button >
				Play from matched word
			</Button>

			<Text>{index + 1}/{total}</Text>
			<Button onClick={prevSegment}>Prev</Button>
			<Button onClick={nextSegment}>Next</Button>

			<TimeLine />

			{media &&
				<Text>
					<SubtitleView mediaId={media.id} />
				</Text>
			}
		</Box>
	)
}


function TimeLine() {
	const [progress, setProgress] = useState(0)

	const { player, duration } = usePlayerTime({
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
			size = "xs"
		>
			<Progress.Label mb="2">
				Time
			</Progress.Label>
			<Progress.Track>
				<Progress.Range transition="none"/>
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
