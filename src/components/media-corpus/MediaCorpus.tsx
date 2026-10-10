"use client"

import { HStack, Input, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { useCorpusMediaQuery } from "./hooks"
import { CorpusYoutubePlayer } from "./CorpusYoutubePlayer"

export function MediaCorpus() {
	const [lemma, setLemma] = useState("open")
	const [pos, setPos] = useState("")

	const { data } = useCorpusMediaQuery(lemma, pos)

	return (
		<VStack>
			<HStack>
				<Input value={lemma} onChange={(e) => setLemma(e.currentTarget.value)} placeholder="lemma" />
				<Input value={pos} onChange={(e) => setPos(e.currentTarget.value)} placeholder="pos" />
			</HStack>
			{data &&
				<CorpusYoutubePlayer match={data.matches[0]} />
			}
			{/* <CorpusYoutubePlayer videoId="1zaoRUTkv7A"/> */}
		</VStack>
	)
}
