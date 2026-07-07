
export async function speak(speech: ArrayBuffer, rate: number = 1.0) {
	const blob = new Blob([speech], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url)
	audio.playbackRate = rate
	audio.preservesPitch = true
	return audio.play()
}
