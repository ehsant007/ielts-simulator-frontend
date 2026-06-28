"use client"

import React from "react"
import { useModuleStore } from "./ModuleProvider";
import { ContextMenu as _ContextMenu, useLangToolsStore, ContextMenuState } from "../lang-tools";


export function ContextMenu({ children }: { children: React.ReactNode }) {
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const copiedText = useLangToolsStore((state)=>state.copiedText)

	function paste(context: ContextMenuState) {
		if (!context.target)
			return

		if (!(context.target instanceof HTMLInputElement))
			return

		if (!copiedText)
			return

		if (!context.target.hasAttribute("data-question-num"))
			return

		setAnswer(Number(context.target.dataset.questionNum), [copiedText])
	}

	
	return (
		<_ContextMenu paste={paste}>
			{children}
		</_ContextMenu>
	)
}
