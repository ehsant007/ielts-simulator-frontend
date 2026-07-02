// app/components/TTSButton.tsx
"use client";
import { AbsoluteCenter, Button, IconButton, ProgressCircle, Spinner, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useLangToolsStore } from "./LangToolsProvider";

export async function speak(speech: ArrayBuffer, rate: number = 1.0) {
	const blob = new Blob([speech], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url)
	audio.playbackRate = rate
	audio.preservesPitch = true
	audio.play()
}

export type ProgressInfo = {
	name: string
	file: string
	status: string
	loaded: number
	total: number
	progress: number
}

export function TTSButton({ text }: { text: string }) {
	const workerRef = useRef<Worker | null>(null);
	const cache = useLangToolsStore((state) => state.ttsCache[text])
	const addToTtsCache = useLangToolsStore((state) => state.addToTtsCache)
	const countRef = useRef(0)
	const [progress, setProgress] = useState<ProgressInfo | null>(null)
	const [waiting, setWaiting] = useState(false)


	const generate = () => {
		setWaiting(true)
		workerRef.current?.postMessage({ type: "generate", text })
	}

	const handleClick = useCallback(async () => {
		if (!cache) {
			generate()
			return
		}

		const rate = countRef.current % 2 === 0 ? 1.0 : 0.6
		countRef.current++
		speak(cache, rate)
	}, [cache, text])


	useEffect(() => {
		if (cache)
			return

		// The worker is only created on the client
		const worker = new Worker(
			new URL("./services/tts.ts", import.meta.url),
			{ type: "module" }
		);

		worker.postMessage({ type: "load" });

		worker.onmessage = (e) => {
			switch (e.data.type) {
				case "result":
					addToTtsCache(text, e.data.wav)
					setWaiting(false)
					speak(e.data.wav)
					break
				case "progress":
					setProgress(e.data.info)
					break
				case "ready":
					if (waiting)
						generate()
					break
			}
		};

		workerRef.current = worker
		return () => worker.terminate();
	}, []);


	const renderIcon = () => {
		if (waiting && progress) {
			return (
				<ProgressCircle.Root size="xs" value={progress.status === "done" ? null : progress?.progress}>
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