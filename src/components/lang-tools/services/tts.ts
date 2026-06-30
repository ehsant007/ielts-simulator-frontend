/// <reference lib="webworker" />

import { KokoroTTS } from "kokoro-js";
const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";

let tts: KokoroTTS | null = null;

onmessage = async (event) => {
	const { type, text, voice } = event.data;

	if (type === "load") {
		tts = await KokoroTTS.from_pretrained(model_id, {
			dtype: "q8", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
			device: "wasm", // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
			progress_callback: (info) => postMessage({ type: "progress" }, [info])
		});
		postMessage({ type: "ready" });
	}

	if (type === "generate" && tts) {
		// Use `tts.list_voices()` to list all available voices
		const audio = await tts.generate(text, { voice: voice ?? "af_heart" });
		const wav = audio.toWav();
		postMessage({ type: "result", wav }, [wav]);
	}
}
