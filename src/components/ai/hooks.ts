import { AiChatCreate, AiChatRead, AiChatUpdate, createChat, deleteChat, readChats, readMessages, updateChat } from "@/client"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { SetStateAction } from "react"


export const chatsQueryKey = ["ai-chats"] as const
export const messagesQueryKey = (chat_id: string) => ["ai-chats", chat_id, "messages"] as const
export const messageCreateKey = ["ai-message-create"] as const
export const chatCreateKey = ["ai-chat-create"] as const


type UseCollectionProps<T> = {
	onCreateSuccess?: (data: T) => void,
	onCreate?: () => void
	onError?: (data: T) => void
}


export function useChats({ onCreateSuccess }: UseCollectionProps<AiChatRead> = {}) {
	const queryClient = useQueryClient()

	const setChats = (set: SetStateAction<AiChatRead[]>) => {
		queryClient.setQueryData<AiChatRead[]>(
			chatsQueryKey,
			(prev = []) => typeof set === "function" ? set(prev) : set,
		)
	}

	const query = useQuery({
		queryFn: () => readChats().then((res) => res.data),
		queryKey: chatsQueryKey,
	})

	const create = useMutation({
		mutationKey: chatCreateKey,

		mutationFn: (data: AiChatCreate) => createChat({
			body: data,
		}),

		onSuccess: ({ data: newChat }) => {
			setChats(prev => [newChat, ...prev])
			onCreateSuccess?.(newChat)
		}
	})

	const remove = useMutation({
		mutationFn: (chat_id: string) => deleteChat({
			path: { chat_id }
		}),

		onSuccess: (_, chat_id) => {
			setChats(prev => prev.filter((chat) => chat.id !== chat_id))
		},
	})

	const update = useMutation({
		mutationFn: ({ chat_id, data }: { chat_id: string, data: AiChatUpdate }) => updateChat({
			body: data,
			path: { chat_id },
		}),

		onMutate: async ({ chat_id, data }) => {
			await queryClient.cancelQueries({ queryKey: chatsQueryKey })
			const previous = queryClient.getQueryData<AiChatRead[]>(chatsQueryKey) ?? []

			// Add changes optimistically
			setChats(prev => {
				const i = prev.findIndex((chat) => chat.id === chat_id)
				if (i === -1)
					return prev
				return [
					...prev.slice(0, i),
					{ ...prev[i], ...data },
					...prev.slice(i + 1)
				]
			}
			)

			return { previous }
		},

		onSuccess: ({ data }, { chat_id }) => {
			setChats(prev => {
				const i = prev.findIndex((chat) => chat.id === chat_id)
				if (i === -1)
					return prev
				return [
					...prev.slice(0, i),
					data,
					...prev.slice(i + 1)
				]
			}
			)
		},

		onError: (_error, _variables, context) => {
			if (context)
				setChats(context.previous)
		},
	})


	return {
		query,
		create,
		update,
		remove,
	}
}


export function useMessages(chat_id: string | null | undefined) {

	const query = useInfiniteQuery({
		enabled: !!chat_id,
		queryKey: messagesQueryKey(chat_id ?? "no-active-chat"),

queryFn: async ({ pageParam, signal }) => {
    console.log("QUERY", {
        chat_id,
        pageParam,
    })

    const res = await readMessages({
        path: { chat_id: chat_id! },
        query: {
            limit: 3,
            ...pageParam,
        },
        signal,
    })

    console.log("RESULT", res.data)

    return res.data ?? []
},

		initialPageParam: {},

		getPreviousPageParam: (firstPage) =>
			firstPage.length > 0
				? { before: firstPage[0].id }
				: undefined,

		getNextPageParam: (lastPage) =>
			lastPage.length > 0
				? { after: lastPage[lastPage.length - 1].id }
				: undefined,
	})

	return {
		query,
	}
}
