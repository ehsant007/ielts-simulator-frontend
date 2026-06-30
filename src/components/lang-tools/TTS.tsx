// app/components/TTSButton.tsx
"use client";
import { Button, IconButton, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useLangToolsStore } from "./LangToolsProvider";
import { isGenerator } from "motion/react";


export async function speak(speech: ArrayBuffer, rate: number = 1.0) {
	const blob = new Blob([speech], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url)
	audio.playbackRate = rate
	audio.preservesPitch = true
	audio.play()
}

export function TTSButton({ text }: { text: string }) {
	const workerRef = useRef<Worker | null>(null);
	const cache = useLangToolsStore((state) => state.ttsCache[text])
	const addToTtsCache = useLangToolsStore((state) => state.addToTtsCache)
	const countRef = useRef(0)
	const [loading, setLoading] = useState(false)
	const [generating, setGenerating] = useState(false)

	const handleClick = useCallback(async () => {
		if (!cache) {
			setGenerating(true)
			workerRef.current?.postMessage({ type: "generate", text })
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

		setLoading(true)
		worker.postMessage({ type: "load" });

		worker.onmessage = (e) => {
			if (e.data.type === "ready") {
				console.log("TTS ready!");
				setLoading(false)
			}
			if (e.data.type === "result") {
				addToTtsCache(text, e.data.wav)
				setGenerating(false)
				speak(e.data.wav)
			}
			if (e.data.type === "progress") {
				console.log(e.data.info)
			}
		};

		workerRef.current = worker
		return () => worker.terminate();
	}, []);


	return (
		<IconButton onClick={handleClick} minW="unset" h="auto" p="1" variant="ghost">
			{generating ?
				<Spinner size="sm" color={loading ? "red" : "primary"} />
				:
				<HiOutlineSpeakerWave />
			}
		</IconButton>
	)
}