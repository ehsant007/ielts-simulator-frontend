import { AiMessageCreate, AiMessageRead } from "@/client"

type StreamEvent =
	| {
		type: "start"
		request: AiMessageRead
		response: AiMessageRead
	}
	| {
		type: "delta"
		delta: string
	}
	| {
		type: "done"
	}
	| {
		type: "error"
		message: string
	}


export async function* streamMessage(
	data: AiMessageCreate,
	signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {

	// const { response } = await createMessageStream({
	// 	body: data,
	// 	signal,
	// })

	const response = await fetch("/api/v1/ai/messages/stream", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
		signal,
	})

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`)
	}

	if (!response.body) {
		throw new Error("Response has no body")
	}

	const reader = response.body
		.pipeThrough(new TextDecoderStream())
		.getReader()

	let buffer = ""

	try {
		while (true) {
			const { value, done } = await reader.read()

			if (done)
				break

			buffer += value

			const events = buffer.split("\n\n")

			buffer = events.pop() ?? ""

			for (const event of events) {
				if (!event.startsWith("data: "))
					continue

				const json = event.slice("data: ".length)

				yield JSON.parse(json) as StreamEvent
			}
		}

		if (buffer.startsWith("data: ")) {
			yield JSON.parse(
				buffer.slice("data: ".length),
			) as StreamEvent
		}
	}
	catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			// expected cancellation
			return
		}

		throw error
	}
	finally {
		reader.releaseLock()
	}
}