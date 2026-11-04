import { create } from "zustand"
import type { CorpusSegmentRead } from "@/client"

export type CorpusStore = {
	subtitles: Record<number, CorpusSegmentRead[]>
	addSubtitleChunk: (mediaId: number, segments: CorpusSegmentRead[]) => void
}

export const useCorpusStore = create<CorpusStore>()((set) => ({
	subtitles: {},
	addSubtitleChunk: (mediaId, segments) =>
		set((s) => ({
			subtitles: {
				...s.subtitles,
				[mediaId]: (s.subtitles[mediaId]
					? [...s.subtitles[mediaId], ...segments]
					: [...segments]
				).sort((a, b) => a.start - b.start),
			},
		})),
}))
