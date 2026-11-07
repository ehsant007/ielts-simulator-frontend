import { useDictionarySearch } from "../dictionary/hooks"
import { useCorpusOccurrencesQuery } from "../media-corpus/hooks"
import type { LookupMethod, SearchResultItem } from "./types"

export function useSearch(
	method: LookupMethod,
	query: string | undefined | null,
) {
	const dictQuery = useDictionarySearch(
		method === "dictionary" || method === "wordnet" ? query : undefined,
	)
	const corpusQuery = useCorpusOccurrencesQuery(
		method === "corpus" ? query : undefined,
	)

	const searchResult: SearchResultItem[] = []
	let isSearchLoading = false

	switch (method) {
		case "dictionary":
		case "wordnet":
			dictQuery.data?.forEach((headword) => {
				searchResult.push({ id: headword, text: headword })
			})
			isSearchLoading = dictQuery.isLoading
			break
		case "corpus":
			corpusQuery.data?.occurrences.forEach((occur) => {
				searchResult.push({
					id: occur.id,
					text: occur.match,
					partOfSpeech: corpusQuery.data.partOfSpeech,
				})
			})
			isSearchLoading = corpusQuery.isLoading
			break
	}

	return { searchResult, isSearchLoading }
}
