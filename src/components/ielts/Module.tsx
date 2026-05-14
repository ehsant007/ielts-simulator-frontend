"use client"

import { ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

import { ModuleContextProvider } from "./ModuleProvider";

export function Module({ module }: { module: ModuleRead }) {
	let module_ui = null
	switch (module.type) {
		case "listening":
			module_ui = <ListeningModule module={module} />
	}

	return <ModuleContextProvider key={module.id} module={module}>
		{module_ui}
	</ModuleContextProvider>
}