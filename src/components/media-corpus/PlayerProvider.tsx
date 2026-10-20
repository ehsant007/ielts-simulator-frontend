import { createContext, Dispatch, SetStateAction, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { YouTubePlayer } from "react-youtube";

type PlayerContextType = {
	player: YouTubePlayer | null
	setPlayer: Dispatch<SetStateAction<YouTubePlayer | null>>
	duration: number | undefined
	setDuration: Dispatch<SetStateAction<number | undefined>>
	state: number
	setState: Dispatch<SetStateAction<number>>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

type PlayerProviderProps = {
	children: React.ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps) {
	const [player, setPlayer] = useState<YouTubePlayer | null>(null)
	const [duration, setDuration] = useState<number | undefined>(-1)
	const [state, setState] = useState(-1)

	return (
		<PlayerContext.Provider value={{
			player,
			setPlayer,
			duration,
			setDuration,
			state,
			setState
		}} >
			{children}
		</PlayerContext.Provider>
	)
}

type UsePlayerProps = {
	onStateChange?: (state: number) => void
}

export function usePlayer({ onStateChange }: UsePlayerProps = {}) {
	const context = useContext(PlayerContext)
	if (!context)
		throw new Error("usePlayer must be used within PlayerProvider")

	const handleStateChange = useEffectEvent((state: number) => {
		onStateChange?.(state)
	})

	useEffect(() => {
		handleStateChange(context.state)
	}, [context.state])

	return context
}


type UsePlayerTimeProps = {
	deltaMs: number
	onTick?: (time: number) => void
} & UsePlayerProps

export function usePlayerTime({ deltaMs, onTick, ...props }: UsePlayerTimeProps) {
	const context = usePlayer(props)
	const [time, setTime] = useState(0)
	const { player } = context
	const timeRef = useRef(-1)

	const handleTick = useEffectEvent((t: number) => {
		onTick?.(t)
	})

	useEffect(() => {
		if (context.state !== 1)
			return

		const interval = window.setInterval(async () => {
			if (player) {
				const t = await player.getCurrentTime()
				if (t !== timeRef.current) {
					timeRef.current = t
					setTime(t)
					handleTick(t)
				}
			}
		}, deltaMs)

		return () => window.clearInterval(interval)
	}, [player, deltaMs, context.state])

	return { ...context, time }
}