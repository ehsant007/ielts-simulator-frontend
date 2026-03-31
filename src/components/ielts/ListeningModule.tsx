"use client"

import { ModuleRead } from "@/client";

export function Module({ module }: { module: ModuleRead }) {

	return (
		<>
			<h1>
				{module.content.type}
			</h1>
		</>
	)
}