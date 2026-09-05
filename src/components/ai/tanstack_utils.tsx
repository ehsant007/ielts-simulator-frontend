import { InfiniteData, QueryClient } from "@tanstack/react-query"


export function findIndex2D<T>(
	array: T[][],
	predicate: (item: T) => boolean,
): [number, number] {
	for (let i = 0; i < array.length; i++) {
		for (let j = 0; j < array[i].length; j++) {
			if (predicate(array[i][j])) {
				return [i, j]
			}
		}
	}

	return [-1, -1]
}

export function updateItemInInfiniteCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
	update: ((prevItem: T) => T) | Partial<T>
) {
	qc.setQueryData<InfiniteData<T[]>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}

			const pages = prev.pages

			const [p, c] = findIndex2D(pages, (item) => item.id === itemId)
			if (c === -1)
				return prev

			const updatedItem =
				typeof update === "function"
					? update(pages[p][c])
					: { ...pages[p][c], ...update }

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					[
						...pages[p].slice(0, c),
						updatedItem,
						...pages[p].slice(c + 1),
					],
					...pages.slice(p + 1),
				]
			}
		}
	)
}


// export function addItemsToPage<T extends { id: string | number }>(
// 	qc: QueryClient,
// 	queryKey: readonly unknown[],
// 	item: T[],
// 	pageIndex: number,
// ) {
// 	qc.setQueryData<InfiniteData<T[]>>(queryKey,
// 		(prev) => {
// 			if (!prev || prev.pages.length === 0) {
// 				return prev
// 			}

// 			const pages = prev.pages

// 			return {
// 				...prev,
// 				pages: [pages.slice(0, -1), [...pages[]]]
// 			}
// 		}
// 	)
// }


export function removeItemFromInfiniteCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
) {
	qc.setQueryData<InfiniteData<T[]>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}
			const pages = prev.pages

			const [p, c] = findIndex2D(pages, (item) => item.id === itemId)
			if (c === -1)
				return prev

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					[
						...pages[p].slice(0, c),
						...pages[p].slice(c + 1),
					],
					...pages.slice(p + 1),
				]
			}
		}
	)
}


export function updateItemInCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
	update: ((prevItem: T) => T) | Partial<T>
) {
	qc.setQueryData<T[]>(queryKey,
		(prev) => {
			if (!prev) {
				return prev
			}

			const i = prev.findIndex((item) => item.id === itemId)
			if (i === -1)
				return prev

			const updatedItem =
				typeof update === "function"
					? update(prev[i])
					: { ...prev[i], ...update }

			return [
				...prev.slice(0, i),
				updatedItem,
				...prev.slice(i + 1)
			]
		}
	)
}


export function removeItemFromCache<T extends { id: string | number }>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
) {
	qc.setQueryData<T[]>(queryKey,
		(prev) => {
			if (!prev) {
				return prev
			}

			const i = prev.findIndex((item) => item.id === itemId)
			if (i === -1)
				return prev

			return [
				...prev.slice(0, i),
				...prev.slice(i + 1)
			]
		}
	)
}