import { createContext,useContext} from "react";
import { useCorpusLookup } from "./hooks";

type LookupContextType = ReturnType<typeof useCorpusLookup>

const PlayerContext = createContext<LookupContextType | undefined>(undefined)

type SidebarProps = {
	children: React.ReactNode
	lemma: string
	partOfSpeech?: string
}

export function CorpusLookupProvider({ children, lemma, partOfSpeech }: SidebarProps) {
	const result = useCorpusLookup(lemma, partOfSpeech)

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
