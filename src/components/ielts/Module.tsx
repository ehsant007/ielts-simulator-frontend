"use client"

import { AttemptRead, ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

import { ModuleContextProvider } from "./ModuleProvider";
import { ReadingModule } from "./ReadingModule";
import { useState } from "react";
import { StartPage } from "./StartPage";
import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";
import { ModuleMode } from "./store";
import { LangToolsProvider } from "../lang-tools";

type ModuleProps = {
	module: ModuleRead,
	lastAttempt: AttemptRead | undefined,
}

export function Module({ module, lastAttempt }: ModuleProps) {
	const [mode, setMode] = useState<ModuleMode>()

	let module_ui = null
	switch (module.type) {
		case "listening":
			module_ui = <ListeningModule />
			break
		case "reading":
			module_ui = <ReadingModule />
			break
		case "writing":
			module_ui = <WritingModule />
			break
		case "speaking":
			module_ui = <SpeakingModule />
			break
	}

	if (!mode) {
		return (
			<StartPage
				moduleType={module.type}
				onStart={() => setMode("test")}
				onReview={() => setMode("review")}
			/>
		)
	}

	return (
		<LangToolsProvider>
			<ModuleContextProvider
				key={module.id}
				module={module}
				mode={mode}
				lastAttempt={mode === "review" ? lastAttempt : undefined}
			>
				{module_ui}
			</ModuleContextProvider>
		</LangToolsProvider>
	)
}