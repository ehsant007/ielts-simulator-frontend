"use client"

import type { ReadingContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Layout } from "./Layout";
import { Passage } from "./Passage";
import { Test } from "./Test";
import { Box, VStack } from "@chakra-ui/react";

export function ReadingModule() {
	const module1 = useModuleStore((state) => state.module);
	const pi = useModuleStore((state) => state.part);
	const content = module1.content as ReadingContent;
	const part = content.parts[pi]

	return (
		<Layout>
			<Layout.ViewPort
				title="Passage"
				key={`reading-passage-part${pi}`}
			>
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

			<Layout.ViewPort
				title="Questions"
				key={`reading-questions-part${pi}`}
			>
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