import { mediaCorpusLookup } from "@/client";
import { useQuery } from "@tanstack/react-query";


export function useCorpusMediaQuery(lemma: string, pos: string | null) {
	const query = useQuery({
		enabled: !!lemma,
		queryKey: ["corpus-media", lemma, pos],
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
