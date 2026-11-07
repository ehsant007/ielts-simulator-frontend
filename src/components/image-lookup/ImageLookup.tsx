"use client"

import { Box, Image, Link, SimpleGrid, Spinner, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"

type ImageSearchProps = {
	query: string
	partOfSpeech?: string
}

type WikipediaSummary = {
	type?: string
	title: string
	description?: string
	thumbnail?: { source: string; width: number; height: number }
	content_urls?: { desktop?: { page?: string } }
}

type PexelsResponse = {
	photos: {
		id: number
		alt: string
		url: string
		photographer: string
		photographer_url: string
		src: { medium: string; large: string }
	}[]
}

type WikipediaResult = {
	source: "wikipedia"
	title: string
	description?: string
	imageUrl: string
	pageUrl: string
}

type PexelsResult = {
	source: "pexels"
	photos: {
		id: number
		alt: string
		imageUrl: string
		pageUrl: string
		photographer: string
		photographerUrl: string
	}[]
}

type NoResult = { source: "none" }

type SearchResult = (WikipediaResult | PexelsResult | NoResult) & {
	warnings: string[]
}

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY

function cleanQuery(query: string) {
	return query.replace(/\s+/g, " ").trim()
}

// Step 1: the lead image of the Wikipedia article with this exact title.
// Returns null when there is no article, it is a disambiguation page,
// or the article has no image.
async function fetchWikipedia(
	query: string,
	signal: AbortSignal,
): Promise<WikipediaResult | null> {
	const title = encodeURIComponent(query.replace(/\s+/g, "_"))

	const response = await fetch(
		`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
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
		source: "wikipedia",
		title: data.title,
		description: data.description,
		imageUrl: data.thumbnail.source,
		pageUrl:
			data.content_urls?.desktop?.page ??
			`https://en.wikipedia.org/wiki/${title}`,
	}
}

// Step 2: curated stock photos from Pexels.
async function fetchPexels(
	query: string,
	signal: AbortSignal,
): Promise<PexelsResult | null> {
	if (!PEXELS_API_KEY) {
		throw new Error("Pexels: NEXT_PUBLIC_PEXELS_API_KEY is not set")
	}

	const params = new URLSearchParams({
		query,
		per_page: "8",
	})

	const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
		signal,
		headers: { Authorization: PEXELS_API_KEY },
	})

	if (!response.ok) {
		throw new Error(`Pexels: HTTP ${response.status}`)
	}

	const data: PexelsResponse = await response.json()

	if (data.photos.length === 0) {
		return null
	}

	return {
		source: "pexels",
		photos: data.photos.map((photo) => ({
			id: photo.id,
			alt: photo.alt || query,
			imageUrl: photo.src.medium,
			pageUrl: photo.url,
			photographer: photo.photographer,
			photographerUrl: photo.photographer_url,
		})),
	}
}

async function searchImages(
	query: string,
	signal: AbortSignal,
): Promise<SearchResult> {
	const warnings: string[] = []
	let wikipediaFailed = false

	try {
		const wikipedia = await fetchWikipedia(query, signal)

		if (wikipedia) {
			return { ...wikipedia, warnings }
		}
	} catch (error) {
		if (signal.aborted) throw error
		wikipediaFailed = true
		warnings.push("Wikipedia could not be reached.")
	}

	try {
		const pexels = await fetchPexels(query, signal)

		if (pexels) {
			return { ...pexels, warnings }
		}
	} catch (error) {
		if (signal.aborted) throw error

		if (wikipediaFailed) {
			throw new Error("Both image providers failed.")
		}

		warnings.push("Pexels could not be reached.")
	}

	return { source: "none", warnings }
}

export function DictionaryImageSearch({ query }: ImageSearchProps) {
	const searchTerm = cleanQuery(query)
	const isValid = searchTerm.length >= 2

	const { data, error, isPending, isFetching } = useQuery({
		queryKey: ["dictionary-images", searchTerm.toLowerCase()],
		queryFn: ({ signal }) => searchImages(searchTerm, signal),
		enabled: isValid,
		staleTime: Infinity,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		retry: 1,
	})

	if (!isValid) {
		return <Text color="fg.muted">Enter a search term.</Text>
	}

	if (isPending) {
		return (
			<Box py={8} textAlign="center">
				<Spinner />
				<Text mt={2} color="fg.muted">
					Searching images...
				</Text>
			</Box>
		)
	}

	if (error) {
		return <Text color="red.500">{error.message}</Text>
	}

	return (
		<Box>
			{isFetching && (
				<Text fontSize="xs" color="fg.muted" mb={2}>
					Updating results...
				</Text>
			)}

			{data.warnings.map((warning) => (
				<Text key={warning} fontSize="xs" color="orange.500" mb={2}>
					{warning}
				</Text>
			))}

			{data.source === "none" && <Text color="fg.muted">No image found.</Text>}

			{data.source === "wikipedia" && (
				<Box borderWidth="1px" borderRadius="md" overflow="hidden" maxW="320px">
					<Link
						href={data.pageUrl}
						target="_blank"
						rel="noopener noreferrer"
						display="block"
					>
						<Image
							src={data.imageUrl}
							alt={data.title}
							width="100%"
							objectFit="cover"
						/>
					</Link>

					<Box p={2}>
						<Text fontSize="sm" fontWeight="medium">
							{data.title}
						</Text>

						{data.description && (
							<Text fontSize="xs" color="fg.muted" mt={1}>
								{data.description}
							</Text>
						)}

						<Text fontSize="2xs" color="fg.muted" mt={1}>
							Image from{" "}
							<Link
								href={data.pageUrl}
								target="_blank"
								rel="noopener noreferrer"
								textDecoration="underline"
							>
								Wikipedia
							</Link>
						</Text>
					</Box>
				</Box>
			)}

			{data.source === "pexels" && (
				<Box>
					<SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
						{data.photos.map((photo) => (
							<Box
								key={photo.id}
								borderWidth="1px"
								borderRadius="md"
								overflow="hidden"
							>
								<Link
									href={photo.pageUrl}
									target="_blank"
									rel="noopener noreferrer"
									display="block"
								>
									<Image
										src={photo.imageUrl}
										alt={photo.alt}
										width="100%"
										aspectRatio="1"
										objectFit="cover"
										loading="lazy"
									/>
								</Link>

								<Box p={2}>
									<Link
										href={photo.photographerUrl}
										target="_blank"
										rel="noopener noreferrer"
										fontSize="2xs"
										color="fg.muted"
										textDecoration="underline"
									>
										{photo.photographer}
									</Link>
								</Box>
							</Box>
						))}
					</SimpleGrid>

					<Text fontSize="2xs" color="fg.muted" mt={2}>
						Photos provided by{" "}
						<Link
							href="https://www.pexels.com"
							target="_blank"
							rel="noopener noreferrer"
							textDecoration="underline"
						>
							Pexels
						</Link>
					</Text>
				</Box>
			)}
		</Box>
	)
}
