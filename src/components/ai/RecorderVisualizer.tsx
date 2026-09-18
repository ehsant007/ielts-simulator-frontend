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
	width = 320,
	height = 48,
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

		const bars: number[] = []
		const maxBars = Math.ceil(width / (barWidth + barGap))

		let animationFrame = 0
		let lastSample = 0

		const draw = (time: number) => {
			animationFrame = requestAnimationFrame(draw)

			// Add a new bar roughly every 30 ms.
			if (time - lastSample < 30)
				return

			lastSample = time

			analyser.getByteTimeDomainData(data)

			let sum = 0

			for (const value of data) {
				const normalized = (value - 128) / 128
				sum += normalized * normalized
			}

			const rms = Math.sqrt(sum / data.length)

			// Amplify quiet speech a little.
			const level = Math.min(1, rms * 4)

			bars.push(level)

			if (bars.length > maxBars)
				bars.shift()

			ctx.clearRect(0, 0, width, height)

			const centerY = height / 2

			bars.forEach((level, i) => {
				const x = i * (barWidth + barGap)

				// Give every bar a minimum height so silence is still visible.
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
	}, [recorder, width, height, barWidth, barGap])

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				width: "100%",
				height,
				display: "block",
			}}
		/>
	)
}