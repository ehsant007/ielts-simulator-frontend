"use client"

import { useQuery } from "@tanstack/react-query"

export type WikipediaImage = {
	title: string
	description?: string
	imageUrl: string
	width: number
	height: number
	pageUrl: string
}

type WikipediaSummary = {
	type?: string
	title: string
	description?: string
	thumbnail?: { source: string; width: number; height: number }
	content_urls?: { desktop?: { page?: string } }
}

type UseWikipediaImageOptions = {
	/** Wikipedia language edition, e.g. "en", "de", "ar". Defaults to "en". */
	language?: string
	/** Set to false to skip fetching. Defaults to true. */
	enabled?: boolean
}

const MIN_QUERY_LENGTH = 2

function cleanQuery(query: string) {
	return query.replace(/\s+/g, " ").trim()
}

// Returns the lead image of the Wikipedia article with this title, or null
// when there is no article, it is a disambiguation page, or it has no image.
async function fetchWikipediaImage(
	query: string,
	language: string,
	signal: AbortSignal,
): Promise<WikipediaImage | null> {
	const title = encodeURIComponent(query.replace(/\s+/g, "_"))

	const response = await fetch(
		`https://${language}.wikipedia.org/api/rest_v1/page/summary/${title}`,
		{ signal, headers: { Accept: "application/json" } },
	)

	if (response.status === 404) {
		return null
	}

	if (!response.ok) {
		throw new Error(`Wikipedia: HTTP ${response.status}`)
	}

	const data: WikipediaSummary = await response.json()

	if (data.type === "disambiguation" || !data.thumbnail) {
		return null
	}

	return {
		title: data.title,
		description: data.description,
		imageUrl: data.thumbnail.source,
		width: data.thumbnail.width,
		height: data.thumbnail.height,
		pageUrl:
			data.content_urls?.desktop?.page ??
			`https://${language}.wikipedia.org/wiki/${title}`,
	}
}

export function useWikipediaImage(
	query: string,
	{ language = "en", enabled = true }: UseWikipediaImageOptions = {},
) {
	const searchTerm = cleanQuery(query)
	const isValid = searchTerm.length >= MIN_QUERY_LENGTH

	const imageQuery = useQuery({
		queryKey: ["wikipedia-image", language, searchTerm.toLowerCase()],
		queryFn: ({ signal }) => fetchWikipediaImage(searchTerm, language, signal),
		enabled: enabled && isValid,
		staleTime: Infinity,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		retry: 1,
	})

	return imageQuery
}
