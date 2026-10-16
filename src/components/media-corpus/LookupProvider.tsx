import { createContext,useContext} from "react";
import { useCorpusLookup } from "./hooks";

type LookupContextType = ReturnType<typeof useCorpusLookup>

const PlayerContext = createContext<LookupContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode
	lemma: string
	pos: string | null
}

export function LookupProvider({ children, lemma, pos }: SidebarProps) {
	const result = useCorpusLookup(lemma, pos)

	return (
		<PlayerContext.Provider value={result} >
			{children}
		</PlayerContext.Provider>
	)
}



export function useCorpusLookupContext() {
	const context = useContext(PlayerContext)
	if (!context)
		throw new Error("useCorpusLookupContext must be used within PlayerProvider")

	return context
}
