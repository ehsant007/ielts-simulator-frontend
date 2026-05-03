"use client"

import { ModuleRead } from "@/client";
import { ListeningModule } from "./ListeningModule";

export function Module({ module }: { module: ModuleRead }) {

	switch(module.content.type)
	{
		case "listening":
			return <ListeningModule module={module}/>
	}
}