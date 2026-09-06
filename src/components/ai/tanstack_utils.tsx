import { InfiniteData, QueryClient } from "@tanstack/react-query"


export function findIndex2D<P, T>(
	array: P[],
	getItems: (page: P) => T[],
	predicate: (item: T) => boolean,
): [number, number] {
	for (let i = 0; i < array.length; i++) {
		const items = getItems(array[i])
		for (let j = 0; j < items.length; j++) {
			if (predicate(items[j])) {
				return [i, j]
			}
		}
	}

	return [-1, -1]
}

type Page<T, K extends string> = T[] | { [P in K]: T[] }

export function updateItemInInfiniteCache<
	T extends { id: string | number },
	K extends string,
>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	itemId: T["id"],
	update: ((prevItem: T) => T) | Partial<T>
) {
	qc.setQueryData<InfiniteData<Page<T,K>>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}

			const pages = prev.pages
			const [p, c] = findIndex2D(pages, getItems, (item) => item.id === itemId)
			if (c === -1)
				return prev

			const items = getItems(pages[p])
			const updatedItem =
				typeof update === "function"
					? update(items[c])
					: { ...items[c], ...update }

			const updatedItems = [...items.slice(0, c), updatedItem, ...items.slice(c + 1)]

			let updatedPage: P
			if (items === pages[p])
				updatedPage = updatedItems as P
			else
				updatedPage = { ...pages[p], [itemsKey]: updatedItems } as P

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					updatedPage,
					...pages.slice(p + 1),
				]
			}
		}
	)
}


export function removeItemFromInfiniteCache<
	P extends object | T[],
	T extends { id: string | number }
>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	getItems: (page: P) => T[],
	itemsKey: string,
	itemId: T["id"],
) {
	qc.setQueryData<InfiniteData<P>>(queryKey,
		(prev) => {
			if (!prev || prev.pages.length === 0) {
				return prev
			}
			const pages = prev.pages

			const [p, c] = findIndex2D(pages, getItems, (item) => item.id === itemId)
			if (c === -1)
				return prev
			
			const items = getItems(pages[p])
			const updatedItems = [...items.slice(0, c), ...items.slice(c + 1)]

			let updatedPage: P
			if (items === pages[p])
				updatedPage = updatedItems as P
			else
				updatedPage = { ...pages[p], [itemsKey]: updatedItems } as P

			return {
				...prev,
				pages: [
					...pages.slice(0, p),
					updatedPage,
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