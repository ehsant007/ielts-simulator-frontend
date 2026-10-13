import { mediaCorpusLookup, readSubtitleChunk } from "@/client";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";


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

function subtitleChunkQueryOptions(media_id: number, start: number) {
	return queryOptions({
		queryKey: ["subtitle-chunk", media_id, start],
		staleTime: Infinity,
		queryFn: () =>
			readSubtitleChunk({
				query: {
					media_id,
					start,
					end: start + CHUNK_SECONDS,
				},
			}).then(res => res.data),
	})
}

export function useSubtitleChunkQuery(media_id: number, time: number) {
	const queryClient = useQueryClient()

	const start = time - time % CHUNK_SECONDS
	const end = start + CHUNK_SECONDS
	const shouldPrefetchNext = time > start + 0.75 * CHUNK_SECONDS

	const query = useQuery(subtitleChunkQueryOptions(media_id, start))

	useEffect(() => {
		if (!shouldPrefetchNext)
			return

		queryClient.query(subtitleChunkQueryOptions(media_id, end)).catch(() => undefined)
	}, [queryClient, media_id, end, shouldPrefetchNext])

	return query
}