// This file is there only for future, currently is not being used

// ttsWorkerClient.ts

type WorkerRequest = {
	id: string
	type: "speak" | "load"
	text?: string
	voice?: string
}

type WorkerResponse =
	| { type: "result"; id: string; text: string; wav: ArrayBuffer }
	| { type: "progress"; info: any }
	| { type: "error"; id?: string; error: string }

class TTSWorkerClient {
	private worker: Worker | null = null
	private pending = new Map<
		string,
		{
			resolve: (value: any) => void
			reject: (err: any) => void
		}
	>()

	constructor() {
		this.init()
	}

	private init() {
		if (this.worker) 
			return

		this.worker = new Worker(new URL("./worker.ts", import.meta.url),{ type: "module" })

		this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
			const msg = e.data

			if (msg.type === "progress") {
				// optional global event bus hook
				return
			}

			if (msg.type === "result") {
				const handler = this.pending.get(msg.id)
				if (handler) {
					handler.resolve(msg)
					this.pending.delete(msg.id)
				}
				return
			}

			if (msg.type === "error") {
				const handler = this.pending.get(msg.id!)
				if (handler) {
					handler.reject(new Error(msg.error))
					this.pending.delete(msg.id!)
				}
			}
		}
	}

	speak(text: string, voice?: string) {
		const id = crypto.randomUUID()

		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject })

			this.worker!.postMessage({
				id,
				type: "speak",
				text,
				voice,
			} satisfies WorkerRequest)
		})
	}

	load() {
		this.worker!.postMessage({ type: "load" })
	}

	terminate() {
		this.worker?.terminate()
		this.worker = null
		this.pending.clear()
	}
}

// 👇 THIS is the singleton
export const ttsWorkerClient = new TTSWorkerClient()


// worker.ts

// onmessage = async (e) => {
//   const { id, type, text, voice } = e.data

//   if (type === "load") {
//     // load model
//     postMessage({ type: "progress", info: "loading" })
//     return
//   }

//   if (type === "speak") {
//     try {
//       const wav = await generateTTS(text, voice)

//       postMessage({
//         type: "result",
//         id,
//         text,
//         wav,
//       })
//     } catch (err) {
//       postMessage({
//         type: "error",
//         id,
//         error: String(err),
//       })
//     }
//   }
// }