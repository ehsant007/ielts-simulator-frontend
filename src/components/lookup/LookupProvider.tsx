import {
	createContext,
	type Dispatch,
	type SetStateAction,
	useContext,
	useState,
} from "react"
import type { LookupMethod, SearchResultItem } from "./types"

type LookupContext = {
	lookupText: string | SearchResultItem
	setLookupText: Dispatch<SetStateAction<LookupContext["lookupText"]>>

	lookupMethod: LookupMethod
	setLookupMethod: Dispatch<SetStateAction<LookupMethod>>
}

const Context = createContext<LookupContext | null>(null)

export function LookupProvider({ children }: { children: React.ReactNode }) {
	const [lookupText, setLookupText] = useState<LookupContext["lookupText"]>("")
	const [lookupMethod, setLookupMethod] = useState<LookupMethod>("dictionary")

	return (
		<Context.Provider
			value={{
				lookupMethod,
				setLookupMethod,
				lookupText,
				setLookupText,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export function useLookupContext() {
	const context = useContext(Context)
	if (context == null)
		throw new Error("useLookupContext must be used within LookupProvider")
	return context
}
