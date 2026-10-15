"use client"

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { YouTubePlayer } from "react-youtube";

type PlayerContextType = {
	player: YouTubePlayer | null
	setPlayer: Dispatch<SetStateAction<YouTubePlayer | null>>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode
}

export function PlayerProvider({ children }: SidebarProps) {
	const [player, setPlayer] = useState<YouTubePlayer | null>(null)

	return (
		<PlayerContext.Provider value={{ player, setPlayer }} >
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


export function usePlayerTime(deltaMs: number) {
	const { player } = usePlayer()
	const [time, setTime] = useState(0)

	useEffect(() => {
		const interval = window.setInterval(async () => {
			if (player)
				setTime(await player.getCurrentTime())
		}, deltaMs)

		return () => window.clearInterval(interval)
	}, [player, deltaMs])

	return { player, time }
}