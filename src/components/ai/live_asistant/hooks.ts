import { useCallback, useEffect, useRef, useState } from "react";
import { AudioRecorder } from "./lib/audio-recorder";
import { AudioStreamer } from "./lib/audio-streamer";

// Legacy property to support outdated iOS devices and Safari versions
interface CustomWindow extends Window {
	webkitAudioContext?: typeof AudioContext;
}

export type UseGoogleLiveAssistantProps = {
	onUserTranscript?: (text: string, partial: boolean) => void
	onAssistantTranscript?: (text: string, partial: boolean) => void
}



export function useGoogleLiveAssistant({
	onUserTranscript,
	onAssistantTranscript,
}: UseGoogleLiveAssistantProps = {}) {
	const [isConnected, setIsConnected] = useState(false);
	const [isRecording, setIsRecording] = useState(false);

	const streamerRef = useRef<AudioStreamer | null>(null);
	const recorderRef = useRef<AudioRecorder | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	// Stop session & clean up memory
	const stopSession = useCallback(() => {
		if (recorderRef.current) {
			recorderRef.current.stop();
			recorderRef.current = null;
		}
		if (streamerRef.current) {
			streamerRef.current.stop();
			streamerRef.current = null;
		}
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsRecording(false);
		setIsConnected(false);
	}, []);

	const wsEventHandler = useCallback((message: {event:string, data:string, partial?:boolean}) => {
		const streamer = streamerRef.current
		if (streamer == null)
			return
		//console.log(message)
		switch (message.event) {
			case "audio":
				const binaryData = Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
				streamer.addPCM16(binaryData);
				break
			case "interrupted":
				streamer.interrupt()
				break
			case "user_transcript":
				onUserTranscript?.(message.data, message.partial!)
				break
			case "assistant_transcript":
				onAssistantTranscript?.(message.data, message.partial!)
				break
		}
	}, [onUserTranscript, onAssistantTranscript])

	// Start session (instantiates Audio & WebSocket lazily on client click)
	const startSession = useCallback(async (url: string) => {
		// Prevent starting multiple sessions
		if (wsRef.current || isConnected) return;

		try {
			// 1. Initialize output stream (24kHz for Gemini output playback)
			const outputAudioCtx = new (window.AudioContext || (window as CustomWindow).webkitAudioContext)({
				sampleRate: 24000,
			});
			const streamer = new AudioStreamer(outputAudioCtx);
			streamerRef.current = streamer;

			// 2. Initialize input recorder (16kHz for Gemini input capture)
			const recorder = new AudioRecorder(16000);
			recorderRef.current = recorder;

			// 3. Open WebSocket connection
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = async () => {
				setIsConnected(true);

				// Resume AudioContext and start microphone recording
				await streamer.resume();
				await recorder.start();
				setIsRecording(true);
			};

			// 4. Handle microphone data -> WebSocket
			const handleRecorderData = (base64AudioChunk: string) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ event: "audio", data: base64AudioChunk }));
				}
			};
			recorder.on("data", handleRecorderData);

			// 5. Handle AI audio responses -> AudioStreamer
			ws.onmessage = async (event) => {
				try {
					const message = JSON.parse(event.data);
					wsEventHandler(message)
				} catch (err) {
					console.error("Failed to parse WebSocket message:", err);
				}
			};

			ws.onclose = () => stopSession();
			ws.onerror = (err) => {
				console.error("WebSocket Error:", err);
				stopSession();
			};
		} catch (err) {
			console.error("Failed to start session:", err);
			stopSession();
		}
	}, [isConnected, stopSession, wsEventHandler]);

	// Clean up if component unmounts while connection is open
	useEffect(() => {
		return () => {
			stopSession();
		};
	}, [stopSession]);

	return {
		startSession,
		stopSession,
		isConnected,
		isRecording,
	};
}



// ws.onmessage = (event) => {
//   const message = JSON.parse(event.data);

//   switch (message.event) {
//     case 'audio':
//       // Feed base64 PCM chunk into Web Audio API / AudioWorklet buffer
//       playAudioChunk(message.data);
//       break;

//     case 'model_transcript':
//       // Append streaming text to live caption overlay or examiner chat bubble
//       updateExaminerCaptions(message.data, message.partial);
//       break;

//     case 'user_transcript':
//       // Display recognized student speech in UI
//       updateStudentCaptions(message.data);
//       break;
//   }
// };