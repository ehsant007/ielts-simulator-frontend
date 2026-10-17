import { CorpusSegmentRead, mediaCorpusLookup, readSubtitleChunk, SegmentWord } from "@/client";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCorpusStore } from "./CorpusStoreProvider"

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

function subtitleChunkQueryOptions(
	media_id: number | undefined | null,
	chunkStart: number,
	addSubtitleChunk: (mediaId: number, segments: CorpusSegmentRead[]) => void,
) {
	return queryOptions({
		enabled: media_id != null,
		queryKey: subtitleChunkKey(media_id!, chunkStart),
		staleTime: Infinity,
		queryFn: async () => {
			const res = await readSubtitleChunk({
				query: {
					media_id: media_id!,
					start: chunkStart,
					end: chunkStart + CHUNK_SECONDS,
				},
			})

			addSubtitleChunk(media_id!, res.data.segments)
			return res.data
		}
	})
}


export function useSubtitleChunkQuery(media_id: number | undefined | null, time: number) {
	const queryClient = useQueryClient()
	const addSubtitleChunk = useCorpusStore(s => s.addSubtitleChunk)

	const start = Math.floor(time / CHUNK_SECONDS) * CHUNK_SECONDS
	const end = start + CHUNK_SECONDS
	const shouldPrefetchNext = time > start + 0.75 * CHUNK_SECONDS

	const query = useQuery(subtitleChunkQueryOptions(media_id, start, addSubtitleChunk))

	useEffect(() => {
		if (!shouldPrefetchNext)
			return

		queryClient.query(subtitleChunkQueryOptions(media_id, end, addSubtitleChunk)).catch(() => undefined)
	}, [queryClient, media_id, end, shouldPrefetchNext, addSubtitleChunk])

	return query
}


function findSegment(segments: CorpusSegmentRead[] | undefined, time: number) {
	if (segments == null)
		return []

	let low = 0
	let high = segments.length - 1

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		const start = segments[mid].start
		const end = segments[mid + 1] ? segments[mid + 1].start : segments[mid].end + 5
		if (start > time)
			high = mid - 1
		else if (end <= time)
			low = mid + 1
		else
			return [segments[mid - 1], segments[mid], segments[mid + 1]]
	}

	return []
}


export function useCurrentSubtitleSegment(mediaId: number | null | undefined, time: number) {
	useSubtitleChunkQuery(mediaId, time)
	const subtitle = useCorpusStore(s => mediaId ? s.subtitles[mediaId] : undefined)

	const segments = useMemo(
		() => findSegment(subtitle, time),
		[subtitle, time],
	)

	const isCurrentWord = useCallback((word: SegmentWord) => {
		return (time >= word.start && time < word.end)
	}, [time])

	return { segments, isCurrentWord }
}