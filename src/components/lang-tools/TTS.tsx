"use client";

import { AbsoluteCenter, IconButton, ProgressCircle } from "@chakra-ui/react"
import { useCallback, useRef, useState } from "react"
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { useKokoroStore, speak } from "./kokoro-tts"


export function TTSButton({ text }: { text: string }) {
	const generate = useKokoroStore((state) => state.generate)
	const progress = useKokoroStore((state) => state.loadingProgress)
	const [waiting, setWaiting] = useState(false)
	const countRef = useRef(0)

	const handleClick = useCallback(async () => {
		setWaiting(true)
		const audio = await generate(text)
		setWaiting(false)

		const rate = countRef.current++ % 2 === 0 ? 1.0 : 0.6
		speak(audio, rate)
	}, [text, generate])

	const renderIcon = () => {

		if (waiting && progress) {
			return (
				<ProgressCircle.Root p="0" size="xs" value={progress.status === "done" ? null : progress?.progress}>
					<ProgressCircle.Circle>
						<ProgressCircle.Track />
						<ProgressCircle.Range />
					</ProgressCircle.Circle>
					<AbsoluteCenter>
						<ProgressCircle.ValueText />
					</AbsoluteCenter>
				</ProgressCircle.Root>
			)
		}

		return <HiOutlineSpeakerWave />
	}

	return (
		<IconButton onClick={handleClick} minW="unset" h="auto" p="1" variant="ghost">
			{renderIcon()}
		</IconButton>
	)
}