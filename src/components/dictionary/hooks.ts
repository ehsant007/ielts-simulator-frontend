import { useQuery } from "@tanstack/react-query"
import { dictionarySearch } from "@/client"

export function useDictionarySearch(text: string | null | undefined) {
	const query = useQuery({
		queryKey: ["dictionary-search", text],
		enabled: !!text,
		queryFn: () =>
			dictionarySearch({
				query: { q: text ?? "" },
			}).then((res) => res.data.headwords),
	})

	return query
}
