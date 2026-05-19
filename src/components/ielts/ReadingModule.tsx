"use client"

import { ModuleRead } from "@/client";
import type { ReadingContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Layout } from "./Layout";
import { Passage } from "./Passage";
import { Test } from "./Test";
import { Box, VStack } from "@chakra-ui/react";

export function ReadingModule({ module }: { module: ModuleRead }) {
	const pi = useModuleStore((state) => state.part);
	const content = module.content as ReadingContent;
	const part = content.parts[pi]

	return (
		<Layout>
			<Layout.ViewPort title="Passage">
				<Box
					px="5"
					py="10"
					shadow="md"
					mx="3"
					mt="3"
					mb="40"
				>
					<Passage {...part.passage} />
				</Box>
			</Layout.ViewPort>

			<Layout.ViewPort title="Questions">
				<VStack
					alignItems="stretch"
					gap="6"
					mx="3"
					mt="3"
					mb="40"
				>
					<Test test={part.test} />
				</VStack>
			</Layout.ViewPort>
		</Layout >
	);
}