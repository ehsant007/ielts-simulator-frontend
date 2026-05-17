"use client"

import { ModuleRead } from "@/client";
import type { ReadingContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Layout } from "./Layout";
import { Passage } from "./Passage";
import { Test } from "./Test";

export function ReadingModule({ module }: { module: ModuleRead }) {
	const pi = useModuleStore((state) => state.part);
	const content = module.content as ReadingContent;
	const part = content.parts[pi]

	return (
		<Layout sectionTitles={["Passage", "Both", "Questions"]}>
			<Layout.ViewPort>
				<Passage {...part.passage}/>
			</Layout.ViewPort>

			<Layout.ViewPort>
				<Test test={part.test}/>
			</Layout.ViewPort>
		</Layout>
	);
}