"use client";

import { AbsoluteCenter, IconButton, ProgressCircle, IconButtonProps, Text } from "@chakra-ui/react"
import { useCallback, useRef, useState } from "react"
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { useKokoroStore, speak } from "./kokoro-tts"

type TTSButtonProps = {
	text: string,
	ipa?: string | null,
} & IconButtonProps

export function TTSButton({ text, ipa, ...props }: TTSButtonProps) {
	const generate = useKokoroStore((state) => state.generate)
	const progress = useKokoroStore((state) => state.loadingProgress)
	const [waiting, setWaiting] = useState(false)
	const countRef = useRef(0)

	const handleClick = useCallback(async () => {
		setWaiting(true)
		const audio = await generate(text)
		setWaiting(false)

		const rate = countRef.current++ % 2 === 0 ? 1.0 : 0.8
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

		<IconButton
			position="relative"
			onClick={handleClick}
			minW="unset"
			h="auto"
			p="1"
			variant="ghost"
			{...props}
		>
			{renderIcon()}
			<Text
				position="absolute"
				top="-0.5"
				right="-0.5"
				fontSize="2xs"
				lineHeight="1"
				fontWeight="medium"
				color={props.color ?? `${props.colorPalette}.fg/80`}
			>
				{ipa}
			</Text>
		</IconButton>


	)
}