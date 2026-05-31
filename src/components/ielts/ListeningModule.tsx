"use client"

import { ListeningContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { VStack } from "@chakra-ui/react";
import { Layout } from "./Layout";
import { Test } from "./Test";
import { AudioScript } from "./AudioScript";

export function ListeningModule() {
	const module1 = useModuleStore((state) => state.module);
	const mode = useModuleStore((state) => state.mode);
	const pi = useModuleStore((state) => state.part);
	const content = module1.content as ListeningContent;
	const part = content.parts[pi];
	const audioScript = part.audio_script;

	return (
		<Layout>
			<Layout.ViewPort
				title="Questions"
				key={`listening-questions-part${pi}`}
			>
				<VStack
					alignItems="stretch"
					justifySelf="center"
					mx="6"
					gap="6"
					mt="3"
					mb="40"
				>
					<Test test={part.test} />
				</VStack>
			</Layout.ViewPort>

			{mode === "review" && (
				<Layout.ViewPort
					title="Utterances"
					key={`listening-audio-script-part${pi}`}
				>
					<VStack
						alignItems="stretch"
						justifySelf="center"
						mx="6"
						gap="6"
						mt="3"
						mb="40"
					>
						<AudioScript script={audioScript} />
					</VStack>
				</Layout.ViewPort>
			)}

		</Layout>
	);
}