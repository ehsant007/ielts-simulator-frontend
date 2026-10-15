import { CorpusSegmentRead, mediaCorpusLookup, readSubtitleChunk, SegmentWord } from "@/client";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";


export function useCorpusOccurrencesQuery(lemma: string, pos: string | null) {
	const query = useQuery({
		queryKey: ["corpus-occurrences", lemma, pos],
		staleTime: Infinity,
		enabled: !!lemma,

		queryFn: () => mediaCorpusLookup({
			query: {
				lemma,
				pos,
				limit: 10,
			}
		}).then(res => res.data),

	})

	return query
}


export function useCorpusLookup(lemma: string, pos: string | null) {
	const { data: { occurrences, media } = {}, isPending } = useCorpusOccurrencesQuery(lemma, pos)

	const [index, setIndex] = useState(0)
	const occurrence = occurrences ? occurrences[index] : null
	const segmentMedia = occurrence && media ? media[occurrence.segment.media_id] : undefined

	const nextSegment = useCallback(() => {
		if (occurrences == null)
			return
		setIndex(prev => (prev + 1 + occurrences.length) % occurrences.length)
	}, [occurrences])

	const prevSegment = useCallback(() => {
		if (occurrences == null)
			return
		setIndex(prev => (prev - 1 + occurrences.length) % occurrences.length)
	}, [occurrences])

	return {
		index,
		total: occurrences?.length ?? 0,
		nextSegment,
		prevSegment,
		segment: occurrence?.segment,
		wordIndex: occurrence?.word_index,
		media: segmentMedia,
		isPending,
	}
}




const CHUNK_SECONDS = 30

export const subtitleChunkKey = (media_id: number, time: number) => ["subtitle-chunk", media_id, time] as const

function subtitleChunkQueryOptions(media_id: number, start: number) {
	return queryOptions({
		queryKey: subtitleChunkKey(media_id, start),
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

	const start = Math.floor(time / CHUNK_SECONDS) * CHUNK_SECONDS
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



function findSegment(segments: CorpusSegmentRead[], time: number) {
	let low = 0
	let high = segments.length - 1

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		if (segments[mid].start > time)
			high = mid - 1
		else if (segments[mid].end <= time)
			low = mid + 1
		else
			return segments[mid]
	}

	return null
}


export function useCurrentSubtitleSegment(mediaId: number, time: number) {
	const { data: chunk } = useSubtitleChunkQuery(mediaId, time)
	const segment = chunk ? findSegment(chunk.segments, time) : null

	const isCurrentWord = useCallback((word: SegmentWord) => {
		return (time >= word.start && time < word.end)
	}, [time])

	return {segment, isCurrentWord}
}