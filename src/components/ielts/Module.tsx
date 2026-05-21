"use client"

import { ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

import { ModuleContextProvider } from "./ModuleProvider";
import { ReadingModule } from "./ReadingModule";
import { useState } from "react";
import { StartPageListening } from "./StartPage";
import { WritingModule } from "./WritingModule";

export function Module({ module }: { module: ModuleRead }) {

	const [start, setStart] = useState(false)

	let module_ui = null
	switch (module.type) {
		case "listening":
			module_ui = <ListeningModule module={module} />
			break
		case "reading":
			module_ui = <ReadingModule module={module} />
			break
		case "writing":
			module_ui = <WritingModule/>
			break
	}

	if (!start) {
		return (
			<StartPageListening onStart={() => setStart(true)} />
		)
	}

	return <ModuleContextProvider key={module.id} module={module}>
		{module_ui}
	</ModuleContextProvider>
}