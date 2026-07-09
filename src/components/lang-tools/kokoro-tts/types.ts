import { KokoroTTS } from "kokoro-js";

export type RawAudio = Awaited<ReturnType<KokoroTTS["generate"]>>;

export type KokoroOutput = {
	audio: Float32Array<ArrayBufferLike>
	sampleRate: number
}
