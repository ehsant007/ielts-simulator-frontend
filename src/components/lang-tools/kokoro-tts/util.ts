import { KokoroOutput } from "./types";

export async function speak0(speech: ArrayBuffer, rate: number = 1.0) {
	const blob = new Blob([speech], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url)
	audio.playbackRate = rate
	audio.preservesPitch = true
	return audio.play()
}


export async function speak(speech: KokoroOutput[], playbackRate = 1.0) {

	const sampleRate = speech[0].sampleRate

	const samples = new Float32Array(
		speech.reduce((sum, chunk) => sum + chunk.audio.length, 0)
	)

	let offset = 0
	for (const chunk of speech) {
		samples.set(chunk.audio, offset)
		offset += chunk.audio.length
	}

	const audioContext = new AudioContext()

	const audioBuffer = audioContext.createBuffer(
		1, // mono
		samples.length,
		sampleRate
	)

	audioBuffer.copyToChannel(samples, 0)

	const source = audioContext.createBufferSource()
	source.buffer = audioBuffer
	source.playbackRate.value = playbackRate

	source.connect(audioContext.destination)

	await audioContext.resume()

	source.start()

	return source
}

