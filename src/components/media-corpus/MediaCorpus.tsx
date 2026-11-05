"use client"

import { HStack, Input, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { CorpusPlayer } from "./CorpusPlayer"

export function MediaCorpus() {
	const [lemma, setLemma] = useState("open")
	const [pos, setPos] = useState("")

	return (
		<VStack>
			<HStack>
				<Input
					id="lemma"
					value={lemma}
					onChange={(e) => setLemma(e.currentTarget.value)}
					placeholder="lemma"
				/>
				<Input
					id="pos"
					value={pos}
					onChange={(e) => setPos(e.currentTarget.value)}
					placeholder="pos"
				/>
			</HStack>

			<CorpusPlayer w="full" lemma={lemma} partOfSpeech={pos} />
		</VStack>
	)
}
