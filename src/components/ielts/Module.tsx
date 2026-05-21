"use client"

import { ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

import { ModuleContextProvider } from "./ModuleProvider";
import { ReadingModule } from "./ReadingModule";
import { useState } from "react";
import { StartPage } from "./StartPage";
import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";
import { ModuleMode } from "./store";


type ModuleProps = {
	module: ModuleRead,
	userAnswers: Record<number, string[]> | undefined,
}

export function Module({ module, userAnswers }: ModuleProps) {
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

	console.log(userAnswers)

	return <ModuleContextProvider
		key={module.id}
		module={module}
		mode={mode}
		answers={mode === "review" ? userAnswers : undefined}
	>
		{module_ui}
	</ModuleContextProvider>
}