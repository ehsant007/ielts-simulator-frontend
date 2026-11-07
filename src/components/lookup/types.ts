
export type LookupMethod = "dictionary" | "corpus" | "wordnet"

export type SearchResultItem = {
	id: number | string,
	text: string,
	partOfSpeech?: string | null,
}

