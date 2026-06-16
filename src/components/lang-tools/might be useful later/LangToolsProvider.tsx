"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
	useEffect
} from "react";
import { Box, Portal } from "@chakra-ui/react";

// --- Types ---

type SelectionData = {
	text: string;
	from: number;
	to: number;
	x: number;
	y: number;
};

type LangToolsContextType = {
	selection: SelectionData | null;
	closeMenu: () => void;
	setSelection: (data: SelectionData | null) => void;
};

type LangToolsProviderProps = {
	children: React.ReactNode;
};

type SelectionMenuShellProps = {
	children: React.ReactNode; // The content to be monitored for selection
	renderMenu: (selection: SelectionData) => React.ReactNode; // The custom menu UI
};

// --- Context ---

const LangToolsContext = createContext<LangToolsContextType | undefined>(undefined);

export const useLangTools = () => {
	const context = useContext(LangToolsContext);
	if (!context) throw new Error("useLangTools must be used within a LangToolsProvider");
	return context;
};

// --- Provider ---

export function LangToolsProvider({ children }: LangToolsProviderProps) {
	const [selection, setSelection] = useState<SelectionData | null>(null);

	const closeMenu = useCallback(() => setSelection(null), []);

	return (
		<LangToolsContext.Provider value={{ selection, setSelection, closeMenu }}>
			{children}
		</LangToolsContext.Provider>
	);
}

// --- Logic Component (The Shell) ---

export function SelectionMenuShell({
	children,
	renderMenu
}: SelectionMenuShellProps) {
	const { setSelection, closeMenu } = useLangTools();
	const rootRef = useRef<HTMLDivElement>(null);

	// Handle text selection logic
	const handleMouseUp = useCallback(() => {
		const root = rootRef.current;
		const selectionObj = window.getSelection();

		if (!root || !selectionObj || selectionObj.isCollapsed || selectionObj.rangeCount === 0) {
			closeMenu();
			return;
		}

		const range = selectionObj.getRangeAt(0);

		// Ensure the selection is inside our root element
		if (!root.contains(range.commonAncestorContainer)) {
			closeMenu();
			return;
		}

		const text = range.toString();
		if (!text.trim()) {
			closeMenu();
			return;
		}

		// Calculate absolute indices relative to the root element content
		const preRange = document.createRange();
		preRange.selectNodeContents(root);
		preRange.setEnd(range.startContainer, range.startOffset);

		const from = preRange.toString().length;
		const to = from + text.length;
		const rect = range.getBoundingClientRect();

		setSelection({
			text,
			from,
			to,
			x: rect.left + rect.width / 2,
			y: rect.top,
		});
	}, [closeMenu, setSelection]);

	// Close menu when clicking outside the selection area or on the document
	useEffect(() => {
		const handleDocumentClick = (e: MouseEvent) => {
			// If the click is not on the selection range, you might want to close it
			// This is optional depending on desired behavior
		};
		document.addEventListener("mousedown", handleDocumentClick);
		return () => document.removeEventListener("mousedown", handleDocumentClick);
	}, []);

	const { selection } = useLangTools();

	return (
		<Box ref={rootRef} onMouseUp={handleMouseUp} position="relative">
			{children}

			{selection && (
				<Portal>
					<Box
						position="fixed"
						left={`${selection.x}px`}
						top={`${selection.y}px`}
						transform="translate(-50%, -100%)"
						zIndex={9999}
						// Prevent the menu click from triggering a "mouseUp" on the root and flickering
						onMouseDown={(e) => e.stopPropagation()}
						bg="bg.panel"
						shadow="md"
						px="3"
						py="1"
						borderRadius="md"
					>
						{renderMenu(selection)}
					</Box>
				</Portal>
			)}
		</Box>
	);
}
