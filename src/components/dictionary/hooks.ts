import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { dictionarySearch, readDictionaryHistory } from "@/client"

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

export function useDictionaryHistory() {
	return useInfiniteQuery({
		queryKey: ["dictionary-history"],
		queryFn: ({ pageParam }) =>
			readDictionaryHistory({
				query: { limit: 20, cursor: pageParam },
			}).then((res) => res.data),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
		select: (data) => data.pages.flatMap((page) => page.history),
	})
}
