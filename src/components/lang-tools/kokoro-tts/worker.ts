/// <reference lib="webworker" />

import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { KokoroOutput, RawAudio } from "./types";
const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";

let tts: KokoroTTS | null = null;

onmessage = async (event) => {
	const { type, text, voice } = event.data;


	function postResult(result: RawAudio) {
		const audio: KokoroOutput = { audio: result.audio, sampleRate: result.sampling_rate }
		postMessage({ type: "result", text, audio }, [result.audio.buffer])
	}

	if (type === "load") {
		tts = await KokoroTTS.from_pretrained(model_id, {
			dtype: "q8", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
			device: "wasm", // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
			progress_callback: (info) => postMessage({ type: "progress", info })
		});

		if (!tts)
			console.log(`Failed to load model ${model_id}`)

		postMessage({ type: "ready" });
		return
	}

	if (!tts)
		return

	if (type === "generate") {
		const audio = await tts.generate(text, { voice: voice ?? "af_heart" })
		postResult(audio)
		return
	}

	if (type === "stream0") {
		const splitter = new TextSplitterStream()
		const stream = tts.stream(splitter);
		(async () => {
			for await (const { text, phonemes, audio } of stream) {
				console.log({ text, phonemes })
				postResult(audio)
			}
		})();

		splitter.push(text)
		return
	}


	if (type === "stream") {
		const splitter = new TextSplitterStream()
		const stream = tts.stream(splitter);
		(async () => {
			for await (const { text, phonemes, audio } of stream) {
				console.log({ text, phonemes })
				postResult(audio)
			}

			postMessage({ type: "stream-done" })
		})();

		splitter.push(text)
		return
	}
}
