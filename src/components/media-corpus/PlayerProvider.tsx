import { createContext, Dispatch, SetStateAction, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { YouTubePlayer } from "react-youtube";

type PlayerContextType = {
	player: YouTubePlayer | null
	setPlayer: Dispatch<SetStateAction<YouTubePlayer | null>>
	duration: number | undefined
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode
}

export function PlayerProvider({ children }: SidebarProps) {
	const [player, setPlayer] = useState<YouTubePlayer | null>(null)
	const [duration, setDuration] = useState<number | undefined>(undefined)

	useEffect(() => {
		const asyncWork = async () => {
			const duration = await player?.getDuration()
			setDuration(duration)
		}

		asyncWork()
	}, [player])

	return (
		<PlayerContext.Provider value={{ player, setPlayer, duration }} >
			{children}
		</PlayerContext.Provider>
	)
}

export function usePlayer() {
	const context = useContext(PlayerContext)
	if (!context)
		throw new Error("usePlayer must be used within PlayerProvider")
	return context
}


type UserPlayerTimeProps = {
	deltaMs: number
	onTick?: (time: number) => void
}

export function usePlayerTime({ deltaMs, onTick }: UserPlayerTimeProps) {
	const context = usePlayer()
	const [time, setTime] = useState(0)
	const { player } = context
	const timeRef = useRef(-1)

	const handleTick = useEffectEvent((t: number) => {
		onTick?.(t)
	})

	useEffect(() => {
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
	}, [player, deltaMs])

	return { ...context, time }
}