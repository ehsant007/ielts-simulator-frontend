"use client"

import { CorpusMatch } from "@/client"
import { Box, Button } from "@chakra-ui/react"
import { useRef } from "react"
import YouTube, { type YouTubeProps } from "react-youtube"

type YouTubePlayer = Parameters<
	NonNullable<YouTubeProps["onReady"]>
>[0]["target"]

type Props = {
	match: CorpusMatch
}

export function CorpusYoutubePlayer({ match }: Props) {
	const playerRef = useRef<YouTubePlayer | null>(null)

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
		},
	}

	return (
		<Box>
			<YouTube
				videoId={match.media.media_id!}
				opts={options}
				onReady={onReady}
			/>

			<Button onClick={() => playAt(match.context_segments[match.matched_segment_index].start)}>
				Play from matched word
			</Button>
		</Box>
	)
}