"use client"

import { CorpusMatch, CorpusSegment, SegmentWord, SubtitleChunk } from "@/client"
import { Box, Button, Text } from "@chakra-ui/react"
import { Fragment, RefObject, useCallback, useEffect, useRef, useState } from "react"
import YouTube, { YouTubePlayer, type YouTubeProps } from "react-youtube"
import { useSubtitleChunkQuery } from "./hooks"


type Props = {
	matches: CorpusMatch[]
}

export function CorpusYoutubePlayer({ matches }: Props) {
	const playerRef = useRef<YouTubePlayer | null>(null)
	const [index, setIndex] = useState(0)
	const match = matches[index]

	const onReady: YouTubeProps["onReady"] = (event) => {
		playerRef.current = event.target
	}

	function playAt(seconds: number) {
		const player = playerRef.current
		if (!player) return

		player.seekTo(seconds, true)
		player.playVideo()
	}

	const options: YouTubeProps["opts"] = {
		// width: "640",
		// height: "390",
		playerVars: {
			autoplay: 0,
			//controls: 0,
		},
	}


	const handleNext = () => {
		setIndex(prev => (prev + 1 + matches.length) % matches.length)
	}

	const handlePrev = () => {
		setIndex(prev => (prev - 1 + matches.length) % matches.length)
	}

	const playAtSegmentStart = useCallback(() => {
		playAt(match.context_segments[match.matched_segment_index].start)
	}, [match])

	useEffect(() => {
		playAtSegmentStart()
	}, [index, playAtSegmentStart])


	return (
		<Box>
			<YouTube
				videoId={match.media.media_id!}
				opts={options}
				onReady={onReady}
			/>

			<Button onClick={playAtSegmentStart} >
				Play from matched word
			</Button>

			<Text>{index + 1}/{matches.length}</Text>
			<Button onClick={handlePrev}>Prev</Button>
			<Button onClick={handleNext}>Next</Button>
			<Box>
				<SubtitleView mediaId={match.media.id} playerRef={playerRef} />
			</Box>
		</Box>
	)
}


function findSegment(segments: CorpusSegment[], time: number) {
	let low = 0
	let high = segments.length - 1

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		if (segments[mid].start > time)
			high = mid - 1
		else if (segments[mid].end <= time)
			low = mid + 1
		else
			return segments[mid]
	}

	return null
}




type SubtitleViewProps = {
	mediaId: number,
	playerRef: RefObject<YouTubePlayer | null>,
}

function SubtitleView({ mediaId, playerRef }: SubtitleViewProps) {
	//const [segment, setSegment] = useState<CorpusSegment | null>(null)
	const [time, setTime] = useState(0)

	const { data: chunk } = useSubtitleChunkQuery(mediaId, time)

	const segment = chunk ? findSegment(chunk.segments, time) : null

	const isMyTime = (word: SegmentWord) => {
		return (time >= word.start && time < word.end)
	}

	useEffect(() => {
		const interval = window.setInterval(async () => {
			const player = playerRef.current
			if (player)
				setTime(await player.getCurrentTime())
		}, 100)

		return () => window.clearInterval(interval)
	}, [playerRef])

	return (
		<>
			{segment?.words.map((w, i) => (
				<Fragment key={i}>
					<span
						className={isMyTime(w) ? "highlight" : ""}
					>
						{w.word}
					</span>
					{" "}
				</Fragment>
			))}
		</>
	)
}
