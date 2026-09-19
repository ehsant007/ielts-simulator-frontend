import { useEffect, useRef } from "react"

type AudioRecorderVisualizerProps = {
	recorder: MediaRecorder | null
	width?: number
	height?: number
	barWidth?: number
	barGap?: number
}

export function AudioRecorderVisualizer({
	recorder,
	barWidth = 3,
	barGap = 2,
}: AudioRecorderVisualizerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (!recorder)
			return

		const canvas = canvasRef.current
		if (!canvas)
			return

		const boundingRect = canvas.getBoundingClientRect()
		const width = boundingRect.width
		const height = boundingRect.height

		canvas.width = width
		canvas.height = height

		const barColor = getComputedStyle(document.documentElement)
			.getPropertyValue("--chakra-colors-primary")
			.trim()

		const ctx = canvas.getContext("2d")
		if (!ctx)
			return

		const audioContext = new AudioContext()
		const source = audioContext.createMediaStreamSource(recorder.stream)
		const analyser = audioContext.createAnalyser()

		analyser.fftSize = 256
		analyser.smoothingTimeConstant = 0.8

		source.connect(analyser)

		const data = new Uint8Array(analyser.fftSize)

		const step = barWidth + barGap
		const maxBars = Math.ceil(width / step)
		const bars: number[] = Array(maxBars).fill(0)

		let animationFrame = 0
		let lastSample: number | null = null

		const sampleInterval = 100

		const draw = (time: number) => {
			animationFrame = requestAnimationFrame(draw)

			if (lastSample === null)
				lastSample = time

			// Add a new sample every sampleInterval ms.
			if (time - lastSample >= sampleInterval) {
				analyser.getByteTimeDomainData(data)

				let sum = 0
				for (const value of data) {
					const normalized = (value - 128) / 128
					sum += normalized * normalized
				}
				const rms = Math.sqrt(sum / data.length)
				
				const level = Math.min(1, rms * 6)
				bars.push(level)
				if (bars.length > maxBars)
					bars.shift()

				lastSample += sampleInterval
			}

			// How far we've progressed toward the next bar.
			const progress = (time - lastSample) / sampleInterval
			const offset = progress * step

			ctx.clearRect(0, 0, width, height)

			const centerY = height / 2

			ctx.fillStyle = barColor

			bars.forEach((level, i) => {

				// Give every bar a minimum height so silence is still visible.
				const x = i * step - offset
				const barHeight = Math.max(2, level * height)

				ctx.fillRect(
					x,
					centerY - barHeight / 2,
					barWidth,
					barHeight,
				)
			})
		}
		if (audioContext.state === "suspended")
			void audioContext.resume()

		animationFrame = requestAnimationFrame(draw)

		return () => {
			cancelAnimationFrame(animationFrame)
			source.disconnect()
			analyser.disconnect()
			void audioContext.close()
		}
	}, [recorder, barWidth, barGap])

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "100%",
				display: "block",
			}}
		/>
	)
}