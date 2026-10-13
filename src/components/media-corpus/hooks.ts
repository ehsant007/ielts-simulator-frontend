import { mediaCorpusLookup, readSubtitleChunk } from "@/client";
import { useQuery } from "@tanstack/react-query";


export function useCorpusMediaQuery(lemma: string, pos: string | null) {
	const query = useQuery({
		queryKey: ["corpus-media", lemma, pos],
		staleTime: Infinity,
		enabled: !!lemma,

		queryFn: () => mediaCorpusLookup({
			query: {
				lemma,
				pos,
				context_size: 1,
				limit: 10,
			}
		}).then(res => res.data),

	})

	return query
}



const CHUNK_SECONDS = 30
export function useSubtitleChunkQuery(media_id: number, time: number) {

	const start = time - time % CHUNK_SECONDS
	const end = start + CHUNK_SECONDS

	const query = useQuery({
		queryKey: ["subtitle-chunk", media_id, start],
		staleTime: Infinity,

		queryFn: () => readSubtitleChunk({
			query: {
				media_id,
				start,
				end,
			}
		}).then(res => res.data),

	})

	// Prefetch next chuck
	useQuery({
		enabled: time > (start + 0.75 * CHUNK_SECONDS),
		queryKey: ["subtitle-chunk", media_id, end],
		staleTime: Infinity,

		queryFn: () => readSubtitleChunk({
			query: {
				media_id,
				start: end,
				end: end + CHUNK_SECONDS,
			}
		}).then(res => res.data),

	})

	return query
}
