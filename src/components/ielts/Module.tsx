"use client"

import { ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

import { ModuleContextProvider } from "./ModuleProvider";
import { ReadingModule } from "./ReadingModule";

export function Module({ module }: { module: ModuleRead }) {
	let module_ui = null
	switch (module.type) {
		case "listening":
			module_ui = <ListeningModule module={module} />
			break
		case "reading":
			module_ui = <ReadingModule module={module} />
			break
	}

	return <ModuleContextProvider key={module.id} module={module}>
		{module_ui}
	</ModuleContextProvider>
}