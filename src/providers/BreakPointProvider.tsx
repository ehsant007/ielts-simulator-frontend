import { useBreakpointValue } from "@chakra-ui/react"
import { createContext, useContext } from "react"

type ChatProviderContextType = {
	isMobile: boolean,
}

const ChatProviderContext = createContext<ChatProviderContextType | undefined>(undefined)

type BreakPointProviderProps = {
	children: React.ReactNode,
}

export function BreakPointProvider({ children }: BreakPointProviderProps) {
	const isMobile = useBreakpointValue({ base: true, md: false, }) ?? true

	return (
		<ChatProviderContext.Provider value={{ isMobile }}>
			{children}
		</ChatProviderContext.Provider>
	)
}

export function useIsMobile() {
	const context = useContext(ChatProviderContext)
	if (!context)
		throw new Error("useIsMobile must be used within BreakPointProvider")
	return context
}
