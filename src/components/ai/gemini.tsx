import { useRef, useState } from "react"
import { GoogleGenAI, type LiveServerMessage } from "@google/genai"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { getGeminiAuthToken } from "@/client"


type LiveSession = Awaited<ReturnType<GoogleGenAI["live"]["connect"]>>

type ConnectionState =
	| "idle"
	| "connecting"
	| "open"
	| "disconnecting"
	| "closed"
	| "error"


interface UseGeminiLiveOptions {
	token: string | null
	model?: string
	onMessage?: (message: LiveServerMessage) => void
	onError?: (error: ErrorEvent) => void
	onClose?: (event: CloseEvent) => void
}



export function useGeminiLive({ onMessage }: UseGeminiLiveOptions) {
	const sessionRef = useRef<LiveSession | null>(null)

	const [state, setState] = useState<ConnectionState>("idle")

	const connect = async () => {
		setState("connecting")

		const ai = new GoogleGenAI({ apiKey: token })

		const session = await ai.live.connect({
			model: "gemini-3.8-live",
			callbacks: {
				onopen: () => setState("open"),
				onmessage: message => onMessage?.(message),
				onerror: () => setState("error"),
				onclose: () => setState("closed"),
			},
		})

		sessionRef.current = session
	}

	const sendAudio = (data: string) => {
		sessionRef.current?.sendRealtimeInput({
			audio: {
				data,
				mimeType: "audio/pcm;rate=16000",
			},
		})
	}

	return {
		state,
		connect,
		sendAudio,
	}
}



export function useGeminiAuthToken() {
	const mut = useMutation({
		mutationKey: ["gemini", "auth-token"],
		mutationFn: () =>
			getGeminiAuthToken().then(res => res.data.token),
	})

	return mut
}
