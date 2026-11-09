import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { dictionarySearch, readDictionaryHistory } from "@/client"
import { useLangToolsStore } from "../lang-tools"

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
	const optimisticHistory = useLangToolsStore((s) => s.translateHistory)

	const query = useInfiniteQuery({
		queryKey: ["dictionary-history"],
		queryFn: ({ pageParam }) =>
			readDictionaryHistory({
				query: { limit: 20, cursor: pageParam },
			}).then((res) => res.data),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
		//select: (data) => data.pages.flatMap((page) => page.history),
	})

	const history = useMemo(() => {
		const map = new Map<string, string>()
		query.data?.pages.flatMap(page=>page.history).forEach((w) => {
			map.set(w.toLowerCase(), w)
		})
		optimisticHistory.forEach((w) => {
			map.delete(w.toLowerCase().trim())
		})
		return [...optimisticHistory, ...map.values()]
	}, [query.data, optimisticHistory])

	return { ...query, history }
}
